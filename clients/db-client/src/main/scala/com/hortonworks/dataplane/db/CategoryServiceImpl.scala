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

package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{Category, CategoryCount, Errors}
import com.hortonworks.dataplane.db.Webservice.CategoryService
import com.typesafe.config.Config
import play.api.Logger
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CategoryServiceImpl(config: Config)(implicit ws: WSClient)
  extends CategoryService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(): Future[Either[Errors, Seq[Category]]] = {
    ws.url(s"$url/categories")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToCategories)
  }

  def search(searchText: String, size: Option[Long]): Future[Either[Errors, Seq[Category]]] = {
    ws.url(s"$url/categories/search/$searchText?size=${size.getOrElse(Long.MaxValue)}")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToCategories)
  }

  def listWithCount(search: Option[String], userId: Long): Future[Either[Errors, Seq[CategoryCount]]] = {
    val countUrl = s"$url/categoriescount?userId=$userId"
    val countUrlWithSearch = search.map(s => s"$countUrl&search=$s").getOrElse(countUrl)
    ws.url(countUrlWithSearch)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToCategoriesCount)
  }

  def listWithCount(categoryName: String): Future[Either[Errors, CategoryCount]] = {
    ws.url(s"$url/categoriescount/$categoryName")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToCategoryCount)
  }

  override def create(category: Category): Future[Either[Errors, Category]] = {
    ws.url(s"$url/categories")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(category))
      .map(mapToCategory)

  }

  override def retrieve(categoryId: String): Future[Either[Errors, Category]] = {
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
      case 200 =>
        Right((res.json \ "results").as[Seq[JsValue]].map { d =>
          d.validate[Category].get
        })
      case _ => mapError(res)
    }
  }

  private def mapToCategory(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Category](
          res,
          r => (r.json \\ "results").head.validate[Category].get)
      case _ => mapError(res)
    }
  }

  private def mapToCategoriesCount(res: WSResponse) = {
    res.status match {
      case 200 =>
        Right(((res.json \ "results").as[Seq[JsValue]].map { d =>
          d.validate[CategoryCount].get
        }))
      case _ => mapError(res)
    }
  }

  private def mapToCategoryCount(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[CategoryCount](
          res,
          r => (r.json \\ "results").head.validate[CategoryCount].get)
      case _ => mapError(res)
    }
  }
}
