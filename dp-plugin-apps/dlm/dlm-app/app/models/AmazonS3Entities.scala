

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
import models.CloudAccountProvider.CloudAccountProvider
import models.CloudCredentialType.CloudCredentialType
import models.CloudResponseEntities.{FileListItem, FileListResponse}
import play.api.libs.json.{JsValue, Json}

object AmazonS3Entities {
  sealed trait Error
  object Error {
    final case class AmazonS3Error(message: String) extends Error
  }
  @SerialVersionUID(124)
  case class S3AccountDetails(provider: String, credentialType: Option[CloudCredentialType], accountName: String, userName: String) extends Serializable with CloudAccountDetails {
    override def getAccountId: String = s"${accountName}_$userName"
  }
  @SerialVersionUID(123)
  case class S3AccountCredential (credentialType: String, accessKeyId: String, secretAccessKey: String) extends Serializable with CloudAccountCredentials

  case class S3FileItem(pathSuffix: String, `type`: String, length: Option[Long], modificationTime: Option[Long]) extends FileListItem
  case class S3FileListResponse(fileList: Seq[S3FileItem], provider: CloudAccountProvider = CloudAccountProvider.S3) extends FileListResponse

  case class StatementPrincipal(AWS: String)
  case class StatementPrincipals(AWS: Seq[String])


  case class PolicyJsValueStatement(Sid: String, Effect: String, Principal: JsValue, Action: JsValue, Resource: JsValue)
  case class PolicyStatement(Sid: String, Effect: String, Principal: StatementPrincipals, Action: Seq[String], Resource: Seq[String])
  case class BucketPolicy(Version: String, Id: String, Statement: Seq[PolicyStatement])

  implicit val statementPrincipalFmt = Json.format[StatementPrincipal]
  implicit val statementPrincipalsFmt = Json.format[StatementPrincipals]
  implicit val policyJsValueStatementFmt = Json.format[PolicyJsValueStatement]
  implicit val policyStatementFmt = Json.format[PolicyStatement]
  implicit val bucketPolicyFmt = Json.format[BucketPolicy]

  implicit val amazonS3ErrorReads = Json.reads[AmazonS3Error]
  implicit val amazonS3ErrorWrites = Json.writes[AmazonS3Error]

}
