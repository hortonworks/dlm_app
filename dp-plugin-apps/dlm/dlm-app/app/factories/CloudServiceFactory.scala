package factories

import com.google.inject.{Inject, Singleton}
import models.CloudAccountEntities.Error.GenericError
import models.CloudAccountProvider
import models.CloudAccountProvider.CloudAccountProvider
import services._

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton
class CloudServiceFactory @Inject()(
  val dlmKeyStore: DlmKeyStore,
  val amazonS3Service: AmazonS3Service,
  val wasbService: WASBService,
  val adlsService: ADLSService){

  def build(accountId: String) : Future[Either[GenericError,CloudService]] = {
    getCloudProvider(accountId) map {
      case Right(cloudType) =>
        cloudType match {
          case CloudAccountProvider.AWS => Right(amazonS3Service)
          case CloudAccountProvider.WASB => Right(wasbService)
          case CloudAccountProvider.ADLS => Right(adlsService)
        }
      case Left(error) => Left(error)
    }
  }

  def getCloudProvider(accountId: String) : Future[Either[GenericError, CloudAccountProvider]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(cloudAccount) => Right(CloudAccountProvider.withName(cloudAccount.accountDetails.provider))
      case Left(error) => Left(GenericError(error.message))
    }
  }

}
