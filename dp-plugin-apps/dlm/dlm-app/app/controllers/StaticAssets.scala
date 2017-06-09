package controllers

import javax.inject.Inject
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
      case _ => NotFound
    }
  }
}