package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.DatasetTag
import domain.CategoryRepo
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Status @Inject()(categoryRepo: CategoryRepo)(implicit exec: ExecutionContext)
    extends JsonAPI {

  def status = Action.async {
    Future.successful(Ok)
  }


  def health = Action.async {
    Future.successful(Ok)
  }



}
