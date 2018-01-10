/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package services

import com.amazonaws.{AmazonClientException}
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.securitytoken.AWSSecurityTokenServiceClient
import com.amazonaws.services.securitytoken.model.{GetCallerIdentityRequest}
import com.typesafe.scalalogging.Logger
import models.AmazonS3Entities.{BucketObject, BucketObjectsResponse, CloudUserDetails, S3AccountCredential, Bucket => DlmBucket}
import models.AmazonS3Entities.Error.{AmazonS3Error}
import models.CloudAccountEntities.Error.{GenericError}
import com.google.inject.{Inject, Singleton}
import models.CloudAccountEntities.{CloudAccountCredentials}

import collection.JavaConverters._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class AmazonS3Service @Inject() (val dlmKeyStore: DlmKeyStore) {

  private val logger = Logger(classOf[AmazonS3Service])

  private def extractFileName(path: String): String = {
    path.split("/")(0)
  }

  private def extractFileType(path: String): String = {
    val splitted = path.split("/")
    if (splitted.length > 1 || path.length - splitted(0).length == 1) "DIRECTORY" else "FILE"
  }

  private def createBasicClient(credential: S3AccountCredential): BasicAWSCredentials = {
    new BasicAWSCredentials(credential.accessKeyId, credential.secretAccessKey)
  }

  private def createS3Client(credential: S3AccountCredential): AmazonS3Client = {
    new AmazonS3Client(createBasicClient(credential))
  }

  private def createSTSClient(credential: S3AccountCredential): AWSSecurityTokenServiceClient = {
    new AWSSecurityTokenServiceClient(createBasicClient(credential))
  }

  def getUserIdentity(credential: CloudAccountCredentials) : Future[Either[AmazonS3Error, CloudUserDetails]] = {
    val awsCredential: S3AccountCredential = credential.asInstanceOf[S3AccountCredential]
    val awsStsClient = createSTSClient(awsCredential)
    val amazonS3Client = createS3Client(awsCredential)
    try {
      val callerIdentityResult = awsStsClient.getCallerIdentity(new GetCallerIdentityRequest)
      val arn = callerIdentityResult.getArn
      val userNameIndex= arn.indexOf(AmazonS3Service.arnUserNameLabel) + AmazonS3Service.arnUserNameLabel.length
      val userName = arn.substring(userNameIndex)
      val accountOwner = amazonS3Client.getS3AccountOwner.getDisplayName
      Future.successful(Right(CloudUserDetails(callerIdentityResult.getAccount, accountOwner, userName)))
    } catch {
      case ex : AmazonClientException =>
        logger.error(ex.getMessage)
        Future.successful(Left(AmazonS3Error(ex.getMessage)))
    }
  }

  def checkUserIdentityValid(accountId: String) : Future[Either[GenericError, Unit]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(result) =>
        val credential = result.accountCredentials.asInstanceOf[S3AccountCredential]
        val awsStsClient = createSTSClient(credential)
        try {
          Right(awsStsClient.getCallerIdentity(new GetCallerIdentityRequest))
        } catch {
          case ex : AmazonClientException =>
            logger.error(ex.getMessage)
            Left(GenericError(ex.getMessage))
        }
      case Left(error) => Left(GenericError(error.message))
    }
  }

  def listAllBuckets(accountId: String) : Future[Either[GenericError, List[DlmBucket]]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(result) =>
        val amazonS3Client = createS3Client(result.accountCredentials.asInstanceOf[S3AccountCredential])
        try {
          Right(amazonS3Client.listBuckets.asScala.toList.map(x =>
            DlmBucket(x.getName, x.getOwner.getDisplayName, x.getCreationDate.toString)))
        } catch {
          case ex : AmazonClientException =>
            logger.error(ex.getMessage)
            Left(GenericError(ex.getMessage))
        }
      case Left(error) => Left(GenericError(error.message))
    }
  }

  def listAllObjects(accountId: String, bucketName: String, path: String) : Future[Either[GenericError, BucketObjectsResponse]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(result) =>
        val amazonS3Client = createS3Client(result.accountCredentials.asInstanceOf[S3AccountCredential])
        try {
          val bucketObjects = amazonS3Client.listObjects(bucketName, path.substring(1)).getObjectSummaries().asScala.toList.flatMap{
            case x if x.getKey.substring(path.substring(1).length).split("/").length == 1 => {
              val rest = x.getKey.substring(path.substring(1).length)
              if (rest == "") None else
              Some(BucketObject(extractFileName(rest), extractFileType(rest), Option(x.getSize), Option(x.getLastModified().getTime())))
            }
            case _ => None
          }
          Right(BucketObjectsResponse(bucketObjects))
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
}