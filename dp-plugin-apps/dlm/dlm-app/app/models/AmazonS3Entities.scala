

/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package models

import java.io.Serializable

import models.AmazonS3Entities.Error._
import models.CloudAccountEntities.{CloudAccountCredentials, CloudAccountDetails}
import play.api.libs.json.{JsValue, Json}

object AmazonS3Entities {
  sealed trait Error
  object Error {
    final case class AmazonS3Error(message: String) extends Error
  }
  @SerialVersionUID(124)
  case class S3AccountDetails(provider: String, accountId: Long, userName: String) extends Serializable with CloudAccountDetails {
    override def getAccountId(): String = s"${accountId.toString}_${userName}"
  }
  @SerialVersionUID(123)
  case class S3AccountCredential (credentialType: String, accessKeyId: String, secretAccessKey: String) extends Serializable with CloudAccountCredentials

  case class CloudUserDetails(accountId: String, accountOwnerName: String, userName: String)
  case class Bucket (name: String, owner: String, creationDate: String)
  case class BucketObject(pathSuffix: String, `type`: String, length: Option[Long] = None, modificationTime: Option[Long] = None)
  case class BucketObjectsResponse(fileList: Seq[BucketObject])

  implicit val cloudUserDetailsReads = Json.reads[CloudUserDetails]
  implicit val cloudUserDetailsWrites = Json.writes[CloudUserDetails]

  implicit val bucketReads = Json.reads[Bucket]
  implicit val bucketWrites = Json.writes[Bucket]

  implicit val bucketObjectReads = Json.reads[BucketObject]
  implicit val bucketObjectWrites = Json.writes[BucketObject]

  implicit val bucketObjectsResponseReads = Json.reads[BucketObjectsResponse]
  implicit val bucketObjectsResponseWrites = Json.writes[BucketObjectsResponse]


  implicit val amazonS3ErrorReads = Json.reads[AmazonS3Error]
  implicit val amazonS3ErrorWrites = Json.writes[AmazonS3Error]

}
