package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.DataAssetService
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.ExecutionContext.Implicits.global

class Asset @Inject()(
      @Named("dataAssetService") val assetService: DataAssetService
                     ) extends Controller {

      def getByGuid(guid: String) = Action.async {
        Logger.info("Received getAssetByUid request")
        assetService
          .findAssetByGuid(guid)
          .map {
            case Left(errors) =>
              InternalServerError(Json.toJson(errors))
            case Right(dataSets) => Ok(Json.toJson(dataSets))
          }
      }

}
