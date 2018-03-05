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

  override def list(name: Option[String]): Future[Either[Errors, Seq[Dataset]]] = {
    val uri = (name match {
      case Some(name) => s"$url/datasets?name=$name"
      case None => s"$url/datasets"
    })
    ws.url(uri)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToDataSets)
  }

  override def create(dataSetAndTags: DatasetAndTags): Future[RichDataset] = {
    ws.url(s"$url/datasets")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(dataSetAndTags))
      .map(mapToRichDataset1)
  }

  override def update(dataSetAndTags: DatasetAndTags): Future[RichDataset] = {
    ws.url(s"$url/datasets")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .put(Json.toJson(dataSetAndTags))
      .map(mapToRichDataset1)
  }

  def create(datasetReq: DatasetCreateRequest): Future[Either[Errors, DatasetAndCategories]] = {
    ws.url(s"$url/datasetswithassets")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(datasetReq))
      .map(mapToDataSetAndCategories)
  }

  def addAssets(datasetId: Long, dataAssets: Seq[DataAsset]) : Future[RichDataset] = {
    ws.url(s"$url/datasets/$datasetId/addassets")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(dataAssets))
      .map(mapToRichDataset1)
  }

  def removeAssets(datasetId: Long, queryString: String) : Future[RichDataset] = {
    ws.url(s"$url/datasets/$datasetId/assets?$queryString")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map(mapToRichDataset1)
  }

  def removeAllAssets(datasetId: Long) : Future[RichDataset] = {
    ws.url(s"$url/datasets/$datasetId/removeallassets")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map(mapToRichDataset1)
  }

  def listRichDataset(queryString: String, userId:Long): Future[Either[Errors, Seq[RichDataset]]] = {
    ws.url(s"$url/richdatasets?$queryString&userId=$userId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToRichDatasets)
  }

  def getRichDatasetById(id: Long,userId:Long): Future[Either[Errors, RichDataset]] = {
    ws.url(s"$url/richdatasets/$id?userId=$userId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToRichDataset)
  }

  def listRichDatasetByTag(tagName: String, queryString: String,userId:Long): Future[Either[Errors, Seq[RichDataset]]] = {
    ws.url(s"$url/richdatasets/tags/$tagName?$queryString&userId=$userId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToRichDatasets)
  }

  def getDataAssetByDatasetId(id:Long, queryName: String, offset: Long, limit: Long) : Future[Either[Errors, AssetsAndCounts]] = {
    ws.url(s"$url/dataassets/$id?queryName=$queryName&offset=$offset&limit=$limit")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToDataAssetsAndCount)
  }



  override def retrieve(datasetId: String): Future[Either[Errors, DatasetAndCategories]] = {
    ws.url(s"$url/datasets/$datasetId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToDataSetAndCategories)
  }

  override def updateDataset(datasetId : String, dataset: Dataset): Future[Dataset] = {
    ws.url(s"$url/datasets/$datasetId")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .patch(Json.toJson(dataset))
      .map(mapDataSet)
  }

  override def delete(datasetId: String): Future[Either[Errors, Long]] = {
    ws.url(s"$url/datasets/$datasetId")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map(mapToLong)
  }

  private def mapToDataSets(res: WSResponse) = {
    res.status match {
      case 200 => extractEntity[Seq[Dataset]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[Dataset].get })
      case _ => mapError(res)
    }
  }

  private def mapDataSet(res: WSResponse) = {
    res.status match {
      case 200 => (res.json \ "results").validate[Dataset].get
      case _ => mapResponseToError(res)
    }
  }

  private def mapToDataSet(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "result" \\ "data") (0).validate[Dataset].get)
      case _ => mapError(res)
    }
  }

  private def mapToLong(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[Long].get)
      case _ => mapError(res)
    }
  }

  private def mapToDataSetAndCategories(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results" \ "data").validate[DatasetAndCategories].get)
      case 404 => Left(Errors(Seq(Error(404, "Resource not found"))))
      case 409 => Left(Errors(Seq(Error(409, "Conflict"))))
      case _ => mapError(res)
    }
  }

  private def mapToRichDataset(res: WSResponse): Either[Errors, RichDataset] = {
    res.status match {
      case 200 => Right((res.json \ "results" \\ "data").head.validate[RichDataset].get)
      case 404 => Left(Errors(Seq(Error(404, "Resource not found"))))
      case _ => mapError(res)
    }
  }

  private def mapToRichDataset1(res: WSResponse): RichDataset = {
    res.status match {
      case 200 => (res.json \ "results" \\ "data").head.validate[RichDataset].get
      case _ => throw new Exception(res.status.toString)
    }
  }


  private def mapToRichDatasets(res: WSResponse): Either[Errors, Seq[RichDataset]] = {
    res.status match {
      case 200 => extractEntity[Seq[RichDataset]](res, r => (r.json \ "results" \\ "data").map { d => d.validate[RichDataset].get })
      case 404 => Left(Errors(Seq(Error(404, "Resource not found"))))
      case _ => mapError(res)
    }
  }

  private def mapToDataAssetsAndCount(res: WSResponse): Either[Errors, AssetsAndCounts] = {
    res.status match {
      case 200 => extractEntity[AssetsAndCounts](res, r => (r.json \ "results" \\ "data").head.validate[AssetsAndCounts].get)
      case 404 => Left(Errors(Seq(Error(404, "Resource not found"))))
      case _ => mapError(res)
    }
  }

}
