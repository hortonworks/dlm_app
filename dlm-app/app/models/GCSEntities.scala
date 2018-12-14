package models

import java.io.Serializable

import models.CloudAccountEntities.{CloudAccountCredentials, CloudAccountDetails}
import models.CloudAccountProvider.CloudAccountProvider
import models.CloudCredentialType.CloudCredentialType
import models.CloudResponseEntities.{FileListItem, FileListResponse}
import models.GCSEntities.Error.GCSClientError
import play.api.libs.json.Json

object GCSEntities {
  sealed trait Error
  object Error {
    final case class GCSClientError(message: String) extends Error
  }

  @SerialVersionUID(151)
  case class GCSAccountDetails(provider: String, credentialType: Option[CloudCredentialType], accountEmail: Option[String])
    extends Serializable with CloudAccountDetails

  @SerialVersionUID(152)
  case class GCSAccountCredential(credentialType: String, accessKeyId: String, secretAccessKey: String)
    extends Serializable with CloudAccountCredentials

  case class GcsFileListItem(pathSuffix: String, `type`: String, length: Option[Long], modificationTime: Option[Long]) extends FileListItem
  case class GcsFileListResponse(fileList: Seq[GcsFileListItem], provider: CloudAccountProvider = CloudAccountProvider.GCS)
    extends FileListResponse

  implicit val gcsClientErrorWrites = Json.writes[GCSClientError]
  implicit val gcsClientErrorReads = Json.reads[GCSClientError]

}
