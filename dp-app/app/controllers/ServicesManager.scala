/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package controllers


import com.google.inject.Inject
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.auth.Authenticated
import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webservice.SkuService
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.ExecutionContext.Implicits.global
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

import scala.concurrent.Future
import scala.util.Left

class ServicesManager @Inject()(@Named("skuService") val skuService:SkuService
                                ,authenticated: Authenticated
                                ,implicit private val configuration: play.api.Configuration) extends Controller{

  private val smartSenseRegex: String = configuration.underlying.getString("smartsense.regex")

  def getServices = Action.async { request =>
    getDpServicesInternal().map{
      case Left(errors) =>handleErrors(errors)
      case Right(services)=>Ok(Json.toJson(services))
    }
  }

  def getEnabledServices= Action.async { request =>
    getDpServicesInternal().map{
      case Left(errors) =>handleErrors(errors)
      case Right(services)=>{
        val enabledServices=services.filter(_.enabled==true)
        Ok(Json.toJson(enabledServices))
      }
    }
  }

  def getDependentServices(skuName: String) = Action.async { request =>
    val dependentServices = getModuleDependentService(skuName)
    if(dependentServices.isDefined){
      Future.successful(Ok(Json.toJson(ServiceDependency(skuName, dependentServices.get.split(",")))))
    }else{
      Future.successful(Ok(Json.toJson(ServiceDependency(skuName, Seq()))))
    }
  }

  def verifySmartSense=Action.async(parse.json) { request =>
    val smartSenseId=request.getQueryString("smartSenseId");
    if (smartSenseId.isEmpty){
      Future.successful(BadRequest("smartSenseId is required"))
    }else{
      if (verifySmartSenseCode(smartSenseId.get)){//TODO meaningful regex from config
        Future.successful(Ok(Json.obj("isValid" -> true)))
      }else{
        Future.successful(Ok(Json.obj("isValid" -> false)))
      }
    }
  }
  def getSkuByName= Action.async { request =>
    val skuNameOpt = request.getQueryString("skuName")
    if (skuNameOpt.isEmpty) {
      Future.successful(BadRequest("skuName not provided"))
    } else {
      skuService.getSku(skuNameOpt.get).map {
        case Left(errors) =>handleErrors(errors)
        case Right(services) => {
          Ok(Json.toJson(services))
        }
      }
    }
  }

  private def verifySmartSenseCode(smartSenseId: String) = {
    smartSenseId.matches(smartSenseRegex)
  }

  def enableService=authenticated.async(parse.json) { request =>
    request.body.validate[DpServiceEnableConfig].map{config=>
      if (!verifySmartSenseCode(config.smartSenseId)){
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
