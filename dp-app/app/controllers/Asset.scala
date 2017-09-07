package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.DataAssetService
import com.hortonworks.dataplane.commons.auth.Authenticated
import models.JsonResponses
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller


import scala.concurrent.ExecutionContext.Implicits.global

class Asset @Inject()(
      @Named("dataAssetService") val assetService: DataAssetService,
      authenticated: Authenticated
                     ) extends Controller {

      def getByGuid(guid : String) = authenticated.async {
        Logger.info("Received getAssetByUid request")
        assetService
          .findAssetByGuid(guid)
          .map {
            case Left(errors) =>
              InternalServerError(
                JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(dataSets) => Ok(Json.toJson(dataSets))
          }
      }

}
