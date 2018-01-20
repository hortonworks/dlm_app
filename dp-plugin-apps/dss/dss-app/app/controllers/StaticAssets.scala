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
    * Generates an `Action` that serves a static resource from an external folder
    *
    * @param rootPath the root folder for searching the static resource files such as `"/home/peter/public"`, `C:\external` or `relativeToYourApp`
    * @param file the file part extracted from the URL
    */
  override def at(rootPath: String, file: String): Action[AnyContent] = Action { request =>
    environment.mode match {
      case Mode.Prod => {

        val fileToServe = rootPath match {
          case AbsolutePath(_) => new File(rootPath, file)
          case _ => new File(environment.getFile(rootPath), file)
        }

        val defaultFileToServe = new File(rootPath, "index.html")

        if (fileToServe.exists) {
          Ok.sendFile(fileToServe, inline = true).withHeaders(CACHE_CONTROL -> "max-age=3600")
        } else {
          Ok.sendFile(defaultFileToServe, inline = true).withHeaders(CACHE_CONTROL -> "max-age=3600")
        }

      }
      case Mode.Dev => {
        val fileToServe = new File("./dss-web/dist", file);

        if (fileToServe.exists) {
          Ok.sendFile(fileToServe, inline = true).withHeaders(CACHE_CONTROL -> "max-age=3600")
        } else {
          NotFound
        }
      }
      case _ => NotFound
    }
  }
}