/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package services

import com.amazonaws.{AmazonClientException, AmazonServiceException}
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.regions.Regions
import com.amazonaws.services.identitymanagement.model.{GetUserPolicyRequest, ListAttachedUserPoliciesRequest}
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.identitymanagement.{AmazonIdentityManagement, AmazonIdentityManagementClient, AmazonIdentityManagementClientBuilder}
import com.amazonaws.services.s3.model.{GetBucketPolicyRequest, ListBucketsRequest}
import com.amazonaws.services.securitytoken.AWSSecurityTokenServiceClient
import com.amazonaws.services.securitytoken.model.{AWSSecurityTokenServiceException, GetCallerIdentityRequest}
import com.typesafe.scalalogging.Logger
import models.AmazonS3Entities.{CloudAccount, CloudUserDetails, Credential, Error, Bucket => DlmBucket}
import models.AmazonS3Entities.Error.{AmazonS3Error, GenericError}
import com.google.inject.{Inject, Singleton}

import collection.JavaConverters._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class AmazonS3Service @Inject() (val dlmKeyStore: DlmKeyStore) {

  private val logger = Logger(classOf[AmazonS3Service])

  def getUserIdentity(credential: Credential) : Future[Either[AmazonS3Error, CloudUserDetails]] = {
    val basicAwsCredential = new BasicAWSCredentials(credential.accessKeyId, credential.secretAccessKey)
    val awsStsClient = new AWSSecurityTokenServiceClient(basicAwsCredential)
    val amazonS3Client = new AmazonS3Client(basicAwsCredential)
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

  def checkUserIdentityValid(accountId: Long, userName: String) : Future[Either[GenericError, Unit]] = {
    val cloudAccount = CloudAccount(accountId, userName)
    dlmKeyStore.getCloudAccount(cloudAccount) map {
      case Right(result) =>
        val basicAwsCredential = new BasicAWSCredentials(result.credential.accessKeyId, result.credential.secretAccessKey)
        val awsStsClient = new AWSSecurityTokenServiceClient(basicAwsCredential)
        val amazonS3Client = new AmazonS3Client(basicAwsCredential)
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

  def listAllBuckets(accountId: Long, userName: String) : Future[Either[GenericError, List[DlmBucket]]] = {
    val cloudAccount = CloudAccount(accountId, userName)
    dlmKeyStore.getCloudAccount(cloudAccount) map {
      case Right(result) =>
        val credential = new BasicAWSCredentials(result.credential.accessKeyId, result.credential.secretAccessKey)
        val amazonS3Client = new AmazonS3Client(credential)
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

}

object AmazonS3Service {
  val arnUserNameLabel = "user/"
}