package com.hw.dp.services.hbase

import com.hw.dp.services.atlas.Atlas
import play.api.libs.json.JsValue

import scala.concurrent.Future
import scala.util.Try
import HBase._

trait AtlasHBaseApi {

  /**
    * Initialize the API
    */
  def initialize: Future[Atlas]

  /**
    * clear caches and shutdown the API connection
    */
  def close

  /**
    * Clients can call this method to check the availability of the cache
    *
    * @return True if cache ready
    */
  def cacheWarmed: Boolean

  /**
    * Look up a hive table using the Atlas API
    *
    * @param tableName
    * @return search result
    */
  def findHBaseTable(tableName: String): Try[PhoenixSearchResult]

  /**
    * Load all hive tables
    *
    * @return Search result
    */
  def allHBaseTables: Try[PhoenixSearchResult]

  /**
    * A quicker version of the table lookup which relies on the underlying
    * cache for getting the table information, clients should try to load
    * table information using this method first.
    *
    * @param tableName
    * @return
    */
  def fastFindHBaseTable(tableName: String): Option[Result]

  /**
    * Load all tables from the cache
    *
    * @return
    */
  def fastLoadAllTables: Seq[Result]

  /**
    * Get raw Entity information
    *
    * @return
    */
  def getEntity(guid: String): JsValue

  /**
    * Get Audit information
    * @param guid
    * @return
    */
  def getAudit(guid:String):JsValue




}
