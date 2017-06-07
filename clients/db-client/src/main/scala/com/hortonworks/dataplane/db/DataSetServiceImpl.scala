package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webservice.DataSetService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * Created by dsingh on 4/6/17.
  */
class DataSetServiceImpl(config: Config)(implicit ws: WSClient)
  extends DataSetService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(): Future[Either[Errors, Seq[Dataset]]] = {
    ws.url(s"$url/datasets")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToDataSets)
  }

  override def create(dataSetAndCatIds: DatasetAndCategoryIds): Future[Either[Errors, DatasetAndCategories]] = {
    ws.url(s"$url/datasets")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(dataSetAndCatIds))
      .map(mapToDataSetAndCategories)
  }

  def create(datasetReq: DatasetCreateRequest): Future[Either[Errors, DatasetAndCategories]] = {
    ws.url(s"$url/datasetswithassets")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(datasetReq))
      .map(mapToDataSetAndCategories)
  }

  def listRichDataset(): Future[Either[Errors, Seq[RichDataset]]] = {
    ws.url(s"$url/richdatasets")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToRichDatasets)
  }

  def getRichDatasetById(id: Long): Future[Either[Errors, RichDataset]] = {
    ws.url(s"$url/richdatasets/$id")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToRichDataset)
  }

  def listRichDatasetByTag(tagName: String): Future[Either[Errors, Seq[RichDataset]]] = {
    ws.url(s"$url/richdatasets/tags/$tagName")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToRichDatasets)
  }

  def getDataAssetByDatasetId(id:Long) : Future[Either[Errors, Seq[DataAsset]]] = {
    ws.url(s"$url/dataassets/$id")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToDataAssets)
  }



  override def retrieve(datasetId: String): Future[Either[Errors, DatasetAndCategories]] = {
    ws.url(s"$url/datasets/$datasetId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToDataSetAndCategories)
  }

  override def update(dataSetAndCatIds: DatasetAndCategoryIds): Future[Either[Errors, DatasetAndCategories]] = {
    ws.url(s"$url/datasets")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .put(Json.toJson(dataSetAndCatIds))
      .map(mapToDataSetAndCategories)
  }

  override def delete(datasetId: String): Future[Either[Errors, Dataset]] = {
    ws.url(s"$url/datasets/$datasetId")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map(mapToDataSet)
  }

  private def mapToDataSets(res: WSResponse) = {
    res.status match {
      case 200 => extractEntity[Seq[Dataset]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[Dataset].get })
      case _ => mapErrors(res)
    }
  }

  private def mapToDataSet(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "result" \\ "data") (0).validate[Dataset].get)
      case _ => mapErrors(res)
    }
  }

  private def mapToDataSetAndCategories(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results" \ "data").validate[DatasetAndCategories].get)
      case 404 => Left(Errors(Seq(Error("404", "Resource not found"))))
      case _ => mapErrors(res)
    }
  }

  private def mapToRichDataset(res: WSResponse): Either[Errors, RichDataset] = {
    res.status match {
      case 200 => Right((res.json \ "results" \\ "data").head.validate[RichDataset].get)
      case 404 => Left(Errors(Seq(Error("404", "Resource not found"))))
      case _ => mapErrors(res)
    }
  }

  private def mapToRichDatasets(res: WSResponse): Either[Errors, Seq[RichDataset]] = {
    res.status match {
      case 200 => extractEntity[Seq[RichDataset]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[RichDataset].get })
      case 404 => Left(Errors(Seq(Error("404", "Resource not found"))))
      case _ => mapErrors(res)
    }
  }

  private def mapToDataAssets(res: WSResponse): Either[Errors, Seq[DataAsset]] = {
    res.status match {
      case 200 => extractEntity[Seq[DataAsset]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[DataAsset].get })
      case 404 => Left(Errors(Seq(Error("404", "Resource not found"))))
      case _ => mapErrors(res)
    }
  }

}
