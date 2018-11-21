

/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

package models

import java.io.Serializable

import models.AmazonS3Entities.Error._
import models.CloudAccountEntities.{CloudAccountCredentials, CloudAccountDetails}
import models.CloudAccountProvider.CloudAccountProvider
import models.CloudCredentialType.CloudCredentialType
import models.CloudResponseEntities.{FileListItem, FileListResponse}
import play.api.libs.json.{JsValue, Json, Writes}

object AmazonS3Entities {
  sealed trait Error
  object Error {
    final case class AmazonS3Error(message: String) extends Error
  }
  @SerialVersionUID(124)
  case class S3AccountDetails(provider: String, credentialType: Option[CloudCredentialType], accountName: Option[String], userName: Option[String]) extends Serializable with CloudAccountDetails

  @SerialVersionUID(123)
  case class S3AccountCredential (credentialType: String, accessKeyId: Option[String], secretAccessKey: Option[String]) extends Serializable with CloudAccountCredentials

  case class S3FileItem(pathSuffix: String, `type`: String, length: Option[Long], modificationTime: Option[Long]) extends FileListItem
  case class S3FileListResponse(fileList: Seq[S3FileItem], provider: CloudAccountProvider = CloudAccountProvider.AWS) extends FileListResponse

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
  implicit val amazonS3ErrorWrites = new Writes[AmazonS3Error] {
    override def writes(o: AmazonS3Error): JsValue = {
      Json.obj(
        "error" -> Json.obj("message" -> o.message)
      )
    }
  }

}
