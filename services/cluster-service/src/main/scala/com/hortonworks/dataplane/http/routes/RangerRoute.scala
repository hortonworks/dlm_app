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

package com.hortonworks.dataplane.http.routes

import java.net.URL
import javax.inject.{Inject, Singleton}

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import com.hortonworks.dataplane.commons.domain.Entities.ClusterService
import com.hortonworks.dataplane.commons.service.api.ServiceNotFound
import com.hortonworks.dataplane.cs.StorageInterface
import com.hortonworks.dataplane.db.Webservice.{ClusterComponentService, ClusterHostsService}
import com.hortonworks.dataplane.http.BaseRoute

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}
import play.api.libs.json.{JsArray, JsObject, JsValue, Json}
import com.hortonworks.dataplane.http.JsonSupport._
import play.api.libs.ws.{WSAuthScheme, WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global


class RangerRoute @Inject()(
      private val clusterComponentService: ClusterComponentService,
      private val clusterHostsService: ClusterHostsService,
      private val storageInterface: StorageInterface,
      private val ws: WSClient
                           ) extends BaseRoute {
  val rangerAudit =
    path ("cluster" / LongNumber / "ranger" / "audit" / Segment / Segment) { (clusterId, dbName, tableName) =>
      parameters("limit".as[Int], "offset".as[Int], "accessType".as[String], "accessResult".as[String]) { (limit, offset, accessType, accessResult) =>
        get {
          println(limit, offset, accessType, accessResult)
          onComplete(requestRangerForAudit(clusterId, dbName, tableName, offset, limit, accessType, accessResult)) {
            case Success(res) => complete(success(res.json))
            case Failure(th) => th match {
              case th:ServiceNotFound => complete(StatusCodes.NotFound, errors(th))
              case _ => complete(StatusCodes.InternalServerError, errors(th))
            }
          }
        }
      }
    }

  val rangerPolicy =
    path ("cluster" / LongNumber / "ranger" / "policies") { clusterId =>
      parameters("limit".as[Int], "offset".as[Int], "serviceType".as[String], "dbName".as[String].?, "tableName".as[String].?, "tags".as[String].?) { (limit, offset, serviceType, dbName, tableName, tags) =>
        get {
          onComplete(requestRangerForPolicies(clusterId, serviceType, dbName, tableName, tags, offset, limit)) {
            case Success(json) => complete(success(json))
            case Failure(th) => th match {
              case th:ServiceNotFound => complete(StatusCodes.NotFound, errors(th))
              case _ => complete(StatusCodes.InternalServerError, errors(th))
            }
          }
        }
      }
    }

  private def requestRangerForPolicies(clusterId: Long, serviceType: String, dbName: Option[String], tableName: Option[String], tags: Option[String], offset: Long, pageSize: Long) : Future[JsArray] = {
    val queries = getBuiltQueries(serviceType, dbName, tableName, tags, offset, pageSize)
    val futures = queries.map { cQuery =>
      for {
        service <- getConfigOrThrowException(clusterId)
        url <- getRangerUrlFromConfig(service)
        baseUrls <- extractUrlsWithIp(url, clusterId)
        user <- storageInterface.getConfiguration("dp.ranger.user")
        pass <- storageInterface.getConfiguration("dp.ranger.password")
        policies <- Try(getRangerPoliciesByServiceTypeAndQuery(baseUrls.head, user, pass, serviceType, cQuery))
      } yield (policies)
    }
    Future.sequence(futures).map(_.flatten).map(JsArray(_))
  }

  private def getBuiltQueries(serviceType: String, dbName: Option[String], tableName: Option[String], tags: Option[String], offset: Long, pageSize: Long): Seq[String] = {
    val query = s"startIndex=${offset}&pageSize=${pageSize}"
    serviceType match {
      case "hive" => Seq(query + s"&resource:database=${dbName.getOrElse("")}&resource:table=${tableName.getOrElse("")}")
      case "tag" => tags.getOrElse("").trim.split(",").filter(cTag => !cTag.isEmpty).map(cTag => query + s"&resource:tag=${cTag.trim}")
      case _ => throw UnsupportedInputException(1000, "This is not a supported Ranger service.")
    }
  }

  private def getRangerServicesForType(uri: String, user: Option[String], pass: Option[String], serviceType: String): Future[Seq[Long]] = {
    ws.url(s"${uri}/service/public/v2/api/service?serviceType=$serviceType")
      .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
      .withAuth(user.get,pass.get, WSAuthScheme.BASIC)
      .get()
      .map { response =>
        (response.json \\ "id").map { id => id.validate[Long].get }
      }
  }

  private def getRangerPoliciesByServiceIdAndQuery(uri: String, user: Option[String], pass: Option[String], serviceId: Long, query: String): Future[Seq[JsObject]] = {
    ws.url(s"${uri}/service/plugins/policies/service/$serviceId?$query")
      .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
      .withAuth(user.get, pass.get, WSAuthScheme.BASIC)
      .get()
      .map { response => (response.json \ "policies").validate[Seq[JsObject]].get }
  }

  private def getRangerPoliciesByServiceTypeAndQuery(uri: String, user: Option[String], pass: Option[String], serviceType: String, query: String): Future[Seq[JsObject]] = {
    getRangerServicesForType(uri, user, pass, serviceType)
      .flatMap { services =>
        val futures = services.map(cServiceId => getRangerPoliciesByServiceIdAndQuery(uri, user, pass, cServiceId, query))
        Future.sequence(futures).map(_.flatten)
      }
  }

  private def requestRangerForAudit(clusterId: Long, dbName: String, tableName: String, offset: Long, pageSize: Long, accessType: String, accessResult:String) : Future[WSResponse] = {
    for {
      service <- getConfigOrThrowException(clusterId)
      url <- getRangerUrlFromConfig(service)
      baseUrls <- extractUrlsWithIp(url, clusterId)
      user <- storageInterface.getConfiguration("dp.ranger.user")
      pass <- storageInterface.getConfiguration("dp.ranger.password")
      urlToHit <- Future.successful(s"${baseUrls.head}/service/assets/accessAudit?startIndex=${offset}&pageSize=${pageSize}&sortBy=eventTime&resourcePath=${dbName}%2F${tableName}&accessType=${accessType}&accessResult=${accessResult}")
      tmp <- Future.successful(println(urlToHit))
      response <- ws.url(urlToHit)
        .withHeaders("Accept" -> "application/json, text/javascript, */*; q=0.01")
        .withAuth(user.get,pass.get,WSAuthScheme.BASIC)
        .get()
    } yield {
      response
    }
  }

  private def getConfigOrThrowException(clusterId: Long) = {
    clusterComponentService.getServiceByName(clusterId, "RANGER").map {
      case Right(endpoints) => endpoints
      case Left(errors) =>
        throw new ServiceNotFound(
          s"Could not get the service Url from storage - $errors")
    }
  }

  def getRangerUrlFromConfig(service: ClusterService): Future[URL] = Future.successful {

    val configsAsList = (service.properties.get \ "properties").as[List[JsObject]]
    val rangerConfig = configsAsList.find(obj =>
      (obj \ "type").as[String] == "admin-properties")
    if (rangerConfig.isEmpty)
      throw ServiceNotFound("No properties found for Ranger")
    val properties = (rangerConfig.get \ "properties").as[JsObject]
    val apiUrl = (properties \ "policymgr_external_url").as[String]
    new URL(apiUrl)
  }

  def extractUrlsWithIp(urlObj: URL, clusterId: Long): Future[Seq[String]] = {

    println(urlObj.getHost)
    clusterHostsService.getHostByClusterAndName(clusterId, urlObj.getHost)
      .map {
        case Right(host) => Seq(s"${urlObj.getProtocol}://${host.ipaddr}:${urlObj.getPort}")
        case Left(errors) => throw new Exception(s"Cannot translate the hostname into an IP address $errors")
      }

  }

}
