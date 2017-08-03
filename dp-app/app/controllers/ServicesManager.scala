package controllers


import com.google.inject.Inject
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{DpService, DpServiceEnableConfig, Errors}
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
  def verifySmartSense=Action.async(parse.json) { request =>
    val smartSenseId=request.getQueryString("smartSenseId");
    if (smartSenseId.isEmpty){
      Future.successful(BadRequest("smartSenseId is required"))
    }else{
      if (smartSenseId.get.startsWith("smart")){//TODO meaningful regex from config
        Future.successful(Ok(true))
      }else{
        Future.successful(Ok(false))
      }
    }
  }
  def enableService=Action.async(parse.json) { request =>
    request.body.validate[DpServiceEnableConfig].map{config=>
      //TODO implementation.
      Future.successful(Ok)
    }.getOrElse(Future.successful(BadRequest))
  }

  def getEnabledServiceDetail= Action.async { request =>
    //TODO imiplementation
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
