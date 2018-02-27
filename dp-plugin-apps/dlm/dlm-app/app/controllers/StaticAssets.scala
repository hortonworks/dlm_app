/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package controllers

import com.google.inject.Inject
import java.io.File

import play.api.Mode
import play.api.mvc.{Action, AnyContent, Controller}
import play.utils.UriEncoding

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class StaticAssets @Inject() (environment: play.api.Environment,
                              configuration: play.api.Configuration) extends ExternalAssets(environment) {


  /**
    * Generates an `Action` that serves a static resource from DLM web home
    *
    * @param file the file part extracted from the URL
    */
  def atDlmPath(file: String): Action[AnyContent] = Action { request =>
    val dlmWebHome : String = configuration.underlying.getString("DLM_WEB_HOME")
    environment.mode match {
      case Mode.Prod => {

        val fileToServe = dlmWebHome match {
          case AbsolutePath(_) => new File(dlmWebHome, file)
          case _ => new File(environment.getFile(dlmWebHome), file)
        }

        val defaultFileToServe = new File(dlmWebHome, "index.html")

        if (fileToServe.exists) {
          Ok.sendFile(fileToServe, inline = true).withHeaders(CACHE_CONTROL -> "max-age=3600")
        } else {
          Ok.sendFile(defaultFileToServe, inline = true).withHeaders(CACHE_CONTROL -> "max-age=3600")
        }

      }
      case _ => NotFound
    }
  }
}