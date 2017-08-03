package controllers


import com.google.inject.Inject
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.auth.Authenticated
import com.hortonworks.dataplane.commons.domain.Entities.{DpService, DpServiceEnableConfig, EnabledSku, Errors}
import com.hortonworks.dataplane.db.Webservice.SkuService
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.ExecutionContext.Implicits.global
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import scala.concurrent.Future
import scala.util.Left

class ServicesManager @Inject()(@Named("skuService") val skuService:SkuService
                               ,authenticated: Authenticated) extends Controller{

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
      if (vefifySmartSenseCode(smartSenseId.get)){//TODO meaningful regex from config
        Future.successful(Ok("true"))
      }else{
        Future.successful(Ok("false"))
      }
    }
  }
  def getSkuByName= Action.async { request =>
    val skuNameOpt = request.getQueryString("skuName")
    if (skuNameOpt.isEmpty) {
      Future.successful(BadRequest("skuName not provided"))
    } else {
      skuService.getSku(skuNameOpt.get)map {
        case Left(errors) =>handleErrors(errors)
        case Right(services) => {
          Ok(Json.toJson(services))
        }
      }
    }
  }

  private def vefifySmartSenseCode(smartSenseId: String) = {
    smartSenseId.startsWith("smart")
  }

  def enableService=authenticated.async(parse.json) { request =>
    request.body.validate[DpServiceEnableConfig].map{config=>
      if (!vefifySmartSenseCode(config.smartSenseId)){
        Future.successful(BadRequest("Invalid Smart SenseId"))
      }else{
        skuService.getSku(config.skuName).flatMap{
          case Left(errors) =>Future.successful(handleErrors(errors))
          case Right(sku)=>{
            val enabledSku=EnabledSku(
              skuId=sku.id.get,
              enabledBy=request.user.id.get,
              smartSenseId = config.smartSenseId,
              subscriptionId =config.smartSenseId//TODO check subscription id later.
            )
            skuService.enableSku(enabledSku).map{
              case Left(errors) =>handleErrors(errors)
              case Right(enabledSku)=>Ok(Json.toJson(enabledSku))
            }
          }
        }
      }
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
