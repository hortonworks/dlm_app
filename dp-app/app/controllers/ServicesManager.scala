package controllers


import com.google.inject.Inject
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{DpService, Errors}
import com.hortonworks.dataplane.db.Webservice.SkuService
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.ExecutionContext.Implicits.global
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import scala.concurrent.Future
import scala.util.Left

class ServicesManager @Inject()(@Named("skuService") val skuService:SkuService) extends Controller{

  def getServices = Action.async { request =>
    getDpServicesInternal().map{
      case Left(errors) =>handleErrors(errors)
      case Right(services)=>Ok(Json.toJson(services))
    }
  }

  def getEnabledServies= Action.async { request =>
    getDpServicesInternal().map{
      case Left(errors) =>handleErrors(errors)
      case Right(services)=>{
        val enabledServices=services.filter(_.enabled==true)
        Ok(Json.toJson(enabledServices))
      }
    }
  }
  def enableService=Action.async { request =>
    //todo smarsense regex check
    //todo insert row in enabledsku
    Future.successful(Ok)
  }
  def getEnabledServiceDetail= Action.async { request =>
    Future.successful(Ok)
  }
  private def getDpServicesInternal(): Future[Either[Errors,Seq[DpService]]] ={
    skuService.getAllSkus().flatMap {
      case Left(errors) => Future.successful(Left(errors))
      case Right(skus) => {
        skuService.getEnabledSkus().map{
          case Left(errors) => Left(errors)
          case Right(enabledSkus)=>{
            val enabledSkusIdMap=enabledSkus.map{enabledSku=>
              (enabledSku.skuId,enabledSku)
            }.toMap

            val dpServices=skus.map{sku=>
              DpService(
                skuName = sku.name,
                enabled = enabledSkusIdMap.contains(sku.id.get) ,
                sku=sku,
                enabledSku=enabledSkusIdMap.get(sku.id.get)
              )
            }
            Right(dpServices)
          }
        }
      }
    }
  }

  private def handleErrors(errors: Errors) = {
    if (errors.errors.exists(_.code == "400"))
      BadRequest(Json.toJson(errors))
    else if (errors.errors.exists(_.code == "403"))
      Forbidden(Json.toJson(errors))
    else
      InternalServerError(Json.toJson(errors))
  }

}
