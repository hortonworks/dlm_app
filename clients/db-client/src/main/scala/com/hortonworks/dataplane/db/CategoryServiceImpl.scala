package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{Category, Errors}
import com.hortonworks.dataplane.db.Webserice.CategoryService
import com.typesafe.config.Config
import play.api.Logger
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CategoryServiceImpl (config: Config)(implicit ws: WSClient)
  extends CategoryService{

  private val url = config.getString("dp.services.db.service.uri")
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(): Future[Either[Errors, Seq[Category]]] ={
    ws.url(s"$url/categories")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToCategories)
  }

  override def create(category: Category): Future[Either[Errors, Category]] ={
    ws.url(s"$url/categories")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(category))
      .map(mapToCategory)

  }

  override def retrieve(categoryId: String): Future[Either[Errors, Category]] ={
    ws.url(s"$url/categories/$categoryId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToCategory)
  }

  override def delete(categoryId: String): Future[Either[Errors, Category]] = {
    ws.url(s"$url/categories/$categoryId")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map(mapToCategory) // TODO fix the return type for delete
  }

  private def mapToCategories(res: WSResponse) = {
    res.status match {
      case 200 => Right(((res.json \ "results").as[Seq[JsValue]].map { d => d.validate[Category].get}))
      case _ => mapErrors(res)
    }
  }

  private def mapToCategory(res: WSResponse) = {
    res.status match {
      case 200 => extractEntity[Category](res, r =>(r.json \\ "results")(0).validate[Category].get)
      case _ => mapErrors(res)
    }
  }
}
