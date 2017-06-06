package controllers

import javax.inject._

import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton
class Status extends Controller {

  def health = Action.async {
    Future.successful(Ok)
  }

}
