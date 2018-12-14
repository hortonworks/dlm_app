package services

import com.google.inject.{Inject, Singleton}
import models.CloudAccountEntities.Error.GenericError
import models.CloudAccountStatus
import models.CloudResponseEntities.{FileListResponse, MountPointsResponse}
import models.Entities.CloudCredentialStatus
import models.GCSEntities.GcsFileListResponse

import scala.concurrent.Future

@Singleton
class GcsService @Inject()(val dlmKeyStore: DlmKeyStore) extends CloudService {

  /**
    * todo: Implement list all files
    * @param accountId
    * @param containerName
    * @param path
    * @return
    */
  override def listFiles(accountId: String, containerName: String, path: String): Future[Either[GenericError, FileListResponse]] = {
    Future.successful(Right(GcsFileListResponse(Seq())))
  }

  /**
    * todo: Implement list all buckets
    * @param accountId
    * @return
    */
  override def listMountPoints(accountId: String): Future[Either[GenericError, MountPointsResponse]] = {
    Future.successful(Right(MountPointsResponse(Seq())))
  }

  // todo: need a way to check if credentials are valid using gcs client
  // For now, mark all registered accounts to be active
  override def checkUserIdentityValid(accountId: String): Future[Either[GenericError, CloudCredentialStatus]] = {
    Future.successful(Right(CloudCredentialStatus(accountId, CloudAccountStatus.ACTIVE)))
  }

}
