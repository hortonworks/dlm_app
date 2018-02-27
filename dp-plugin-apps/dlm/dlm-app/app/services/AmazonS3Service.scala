/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package services

import com.amazonaws.AmazonClientException
import com.amazonaws.auth.{AWSStaticCredentialsProvider, BasicAWSCredentials}
import com.amazonaws.services.s3.{AmazonS3, AmazonS3ClientBuilder}
import com.amazonaws.services.securitytoken.{AWSSecurityTokenService, AWSSecurityTokenServiceClientBuilder}
import com.amazonaws.services.securitytoken.model.{AWSSecurityTokenServiceException, GetCallerIdentityRequest}
import com.amazonaws.regions.Regions
import com.amazonaws.regions.Region
import com.typesafe.scalalogging.Logger
import models.AmazonS3Entities.{BucketPolicy, PolicyJsValueStatement, PolicyStatement, S3AccountCredential, S3AccountDetails, S3FileItem, S3FileListResponse, StatementPrincipal, StatementPrincipals}
import models.AmazonS3Entities.Error.AmazonS3Error
import models.CloudAccountEntities.Error.GenericError
import com.google.inject.{Inject, Singleton}
import com.hortonworks.dlm.beacon.domain.ResponseEntities.{BeaconApiError, BeaconApiErrors}
import models.CloudAccountEntities.{CloudAccountCredentials, CloudAccountDetails}
import models.{AmazonS3Entities, CloudAccountProvider, CloudAccountStatus, CloudCredentialType}
import models.CloudResponseEntities.{FileListItem, FileListResponse, MountPointDefinition, MountPointsResponse}
import models.Entities.CloudCredentialStatus
import play.api.http.Status.BAD_GATEWAY
import play.api.libs.json
import play.api.libs.json.{JsError, JsSuccess, JsValue, Json}
import play.api.libs.ws.ahc.AhcWSResponse

import collection.JavaConverters._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class AmazonS3Service @Inject() (val dlmKeyStore: DlmKeyStore) extends CloudService {

  private val logger = Logger(classOf[AmazonS3Service])

  private def extractFileName(path: String): String = {
    path.split("/")(0)
  }

  private def extractFileType(path: String): String = {
    val splitted = path.split("/")
    if (splitted.length > 1 || path.length - splitted(0).length == 1) "DIRECTORY" else "FILE"
  }

  private def getRegion : String = {
    Regions.getCurrentRegion match {
      case region : Region => region.getName
      case _ => Region.getRegion(Regions.DEFAULT_REGION).getName
    }
  }

  private def createBasicClient(credential: S3AccountCredential): BasicAWSCredentials = {
    new BasicAWSCredentials(credential.accessKeyId, credential.secretAccessKey)
  }

  private def createS3Client(credential: S3AccountCredential): AmazonS3 = {
    AmazonS3ClientBuilder.standard().withRegion(getRegion)
      .withCredentials(new AWSStaticCredentialsProvider(createBasicClient(credential))).build()
  }

  private def createSTSClient(credential: S3AccountCredential): AWSSecurityTokenService = {
    AWSSecurityTokenServiceClientBuilder.standard().withRegion(getRegion)
      .withCredentials(new AWSStaticCredentialsProvider(createBasicClient(credential))).build()
  }

  def getUserIdentity(credential: CloudAccountCredentials) : Future[Either[AmazonS3Error, CloudAccountDetails]] = {
    val awsCredential: S3AccountCredential = credential.asInstanceOf[S3AccountCredential]
    val awsStsClient = createSTSClient(awsCredential)
    try {
      val callerIdentityResult = awsStsClient.getCallerIdentity(new GetCallerIdentityRequest)
      val arn = callerIdentityResult.getArn
      val userNameIndex= arn.indexOf(AmazonS3Service.arnUserNameLabel) + AmazonS3Service.arnUserNameLabel.length
      val userName = arn.substring(userNameIndex)
      val accountId = callerIdentityResult.getAccount
      Future.successful(Right(S3AccountDetails(CloudAccountProvider.S3.toString, Some(CloudCredentialType.S3_TOKEN),
        accountId, userName)))
    } catch {
      case ex : AmazonClientException =>
        logger.error(ex.getMessage)
        Future.successful(Left(AmazonS3Error(ex.getMessage)))
    }
  }


  def getBucketPolicy(accountId: String, bucketName: String) : Future[Either[AmazonS3Error, BucketPolicy]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(result) =>
        val credential = result.accountCredentials.asInstanceOf[S3AccountCredential]
        val amazonS3Client = createS3Client(credential)
        try {
          val policyText = Option(amazonS3Client.getBucketPolicy(bucketName).getPolicyText)
          policyText match {
            case None => Left(AmazonS3Error(AmazonS3Service.bucketPolicyDoesNotExistsErrMsg(bucketName)))
            case Some(policyTextValue) => getTranslatedPolicy(policyTextValue)
          }
        } catch {
          case ex : AmazonClientException =>
            logger.error(ex.getMessage)
            Left(AmazonS3Error(ex.getMessage))
        }
      case Left(error) => Left(AmazonS3Error(error.message))
    }
  }

  def getTranslatedPolicy(policyText: String) : Either[AmazonS3Error, BucketPolicy] = {
    val bucketPolicy = Json.parse(policyText)
    val bucketStatement = (bucketPolicy \ "Statement").get

    val policyStatements : Either[AmazonS3Error, Seq[PolicyJsValueStatement]] = bucketStatement.validate[PolicyJsValueStatement] match {
      case JsSuccess(result, _) => Right(List(result))
      case JsError(error) => {
        bucketStatement.validate[Seq[PolicyJsValueStatement]] match {
          case JsSuccess(result, _) => Right(result)
          case JsError(error) => {
            Left(AmazonS3Error(error.toString()))
          }
        }
      }
    }

    policyStatements match  {
      case Right(statements) => {
        val constructedStatements : Seq[Either[AmazonS3Error, PolicyStatement]] = statements.map(x => {
          val principal : Either [AmazonS3Error, StatementPrincipals] = x.Principal.validate[StatementPrincipal] match {
            case JsSuccess(principalResult, _) => Right(StatementPrincipals(List(principalResult.AWS)))
            case JsError(error) => {
              x.Principal.validate[StatementPrincipals] match {
                case JsSuccess(principalResult, _) => Right(principalResult)
                case JsError(error) => Left(AmazonS3Error(error.toString()))
              }
            }
          }

          val action : Either [AmazonS3Error, Seq[String]] = x.Action.validate[String] match {
            case JsSuccess(actionResult, _) => Right(List(actionResult))
            case JsError(error) => {
              x.Action.validate[Seq[String]] match {
                case JsSuccess(actionResult, _) => Right(actionResult)
                case JsError(error) => {
                  Left(AmazonS3Error(error.toString()))
                }
              }
            }
          }

          val resource: Either [AmazonS3Error, Seq[String]] = x.Resource.validate[String] match {
            case JsSuccess(resourceResult, _) => Right(List(resourceResult))
            case JsError(error) => {
              x.Resource.validate[Seq[String]] match {
                case JsSuccess(resourceResult, _) => Right(resourceResult)
                case JsError(error) => Left(AmazonS3Error(error.toString()))

              }
            }
          }
          val anyError = List(principal, action, resource).find(_.isLeft)
          if (anyError.isDefined) {
            Left(AmazonS3Error(anyError.get.left.get.message))
          } else {
            Right(PolicyStatement(x.Sid, x.Effect, principal.right.get, action.right.get, resource.right.get))
          }

        })
        val filteredConstructedStatements = constructedStatements.filter(_.isRight).map(x => x.right.get)
        Right(BucketPolicy((bucketPolicy \ "Version").get.as[String], (bucketPolicy \ "Id").get.as[String], filteredConstructedStatements))
      }
      case Left(error) => Left(error)
    }
  }


  override def checkUserIdentityValid(accountId: String) : Future[Either[GenericError, CloudCredentialStatus]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(result) =>
        val credential = result.accountCredentials.asInstanceOf[S3AccountCredential]
        val awsStsClient = createSTSClient(credential)
        try {
          val callerIdentity = awsStsClient.getCallerIdentity(new GetCallerIdentityRequest)
          Right(CloudCredentialStatus(accountId, CloudAccountStatus.ACTIVE))
        } catch {
          case ex : AWSSecurityTokenServiceException =>
            logger.error(ex.getMessage)
            if (ex.getStatusCode == 403) {
              Right(CloudCredentialStatus(accountId, CloudAccountStatus.EXPIRED))
            } else {
              Left(GenericError(ex.getMessage))
            }
        }
      case Left(error) => Left(GenericError(error.message))
    }
  }

  /**
    * Lists all buckets
    * @param accountId
    * @return
    */
  override def listMountPoints(accountId: String) : Future[Either[GenericError, MountPointsResponse]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(result) =>
        val amazonS3Client = createS3Client(result.accountCredentials.asInstanceOf[S3AccountCredential])
        try {
          val allBuckets = amazonS3Client.listBuckets.asScala.toList.map(x =>
            MountPointDefinition(x.getName))
          Right(MountPointsResponse(allBuckets))
        } catch {
          case ex : AmazonClientException =>
            logger.error(ex.getMessage)
            Left(GenericError(ex.getMessage))
        }
      case Left(error) => Left(GenericError(error.message))
    }
  }

  override def listFiles(accountId: String, bucketName: String, path: String) : Future[Either[GenericError, FileListResponse]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(result) =>
        val amazonS3Client = createS3Client(result.accountCredentials.asInstanceOf[S3AccountCredential])
        try {
          val bucketObjects = amazonS3Client.listObjects(bucketName, path.substring(1)).getObjectSummaries.asScala.toList.flatMap{
            case x if x.getKey.substring(path.substring(1).length).split("/").length == 1 => {
              val rest = x.getKey.substring(path.substring(1).length)
              if (rest == "") None else
              Some(S3FileItem(extractFileName(rest), extractFileType(rest), Option(x.getSize), Option(x.getLastModified.getTime)))
            }
            case _ => None
          }
          Right(S3FileListResponse(bucketObjects))
        } catch {
          case ex : AmazonClientException =>
            logger.error(ex.getMessage)
            Left(GenericError(ex.getMessage))
        }
      case Left(error) => Left(GenericError(error.message))
    }
  }

}

object AmazonS3Service {
  val arnUserNameLabel = "user/"
  def bucketPolicyDoesNotExistsErrMsg(bucketName: String) : String = "No Bucket policy configured for " + bucketName
}