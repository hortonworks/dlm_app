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

import com.hortonworks.dataplane.commons.domain.Entities.{DatasetCategory, Errors}
import com.hortonworks.dataplane.db.Webservice.DataSetCategoryService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * Created by dsingh on 4/9/17.
  */
class DataSetCategoryServiceImpl  (config: Config)(implicit ws: WSClient)
  extends DataSetCategoryService{

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def getListWithDataSetId(dataSetId: String): Future[Either[Errors, Seq[DatasetCategory]]] = {
    ws.url(s"$url/datasets/$dataSetId/categories")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToDataSetCategories)
  }
  override def getListWithCategoryId(categoryId: String): Future[Either[Errors, Seq[DatasetCategory]]]= {
    ws.url(s"$url/categories/$categoryId/datasets")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToDataSetCategories)
  }
  override def create(dataSetCategory: DatasetCategory): Future[Either[Errors, DatasetCategory]] = {
    ws.url(s"$url/datasets/categories")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(dataSetCategory))
      .map(mapToDataSetCategory)
  }
  override def delete(dataSetId: String, categoryId: String): Future[Either[Errors, DatasetCategory]] = {
    ws.url(s"$url/datasets/$dataSetId/categories/$categoryId")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map(mapToDataSetCategory) // TODO fix the return type for delete
  }

  private def mapToDataSetCategories(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[DatasetCategory]](res,
          r =>
            (r.json \ "results" \\ "data").map { d =>
              d.validate[DatasetCategory].get
            })
      case _ => mapError(res)
    }
  }

  private def mapToDataSetCategory(res: WSResponse) = {
    res.status match {
      case 200 => extractEntity[DatasetCategory](res, r =>(r.json \ "results" \\ "data")(0).validate[DatasetCategory].get)
      case _ => mapError(res)
    }
  }
}