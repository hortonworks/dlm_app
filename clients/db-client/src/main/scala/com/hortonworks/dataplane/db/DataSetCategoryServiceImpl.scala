package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{DatasetCategory, Errors}
import com.hortonworks.dataplane.db.Webserice.DataSetCategoryService
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
      case _ => mapErrors(res)
    }
  }

  private def mapToDataSetCategory(res: WSResponse) = {
    res.status match {
      case 200 => extractEntity[DatasetCategory](res, r =>(r.json \ "results" \\ "data")(0).validate[DatasetCategory].get)
      case _ => mapErrors(res)
    }
  }
}