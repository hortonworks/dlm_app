package com.hw.dp.services.atlas

import com.hw.dp.services.atlas.Hive.{Result, SearchResult}

import scala.concurrent.Future
import scala.util.Try

case class Atlas(restUrl:String)

trait AtlasHiveApi {

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
    * @return True if cache ready
    */
  def cacheWarmed:Boolean


  /**
    * Look up a hive table using the Atlas API
    * @param tableName
    * @return search result
    */
  def findHiveTable(tableName: String): Try[SearchResult]

  /**
    * Load all hive tables
    * @return Search result
    */
  def allHiveTables: Try[SearchResult]

  /**
    * A quicker version of the table lookup which relies on the underlying
    * cache for getting the table information, clients should try to load
    * table information using this method first.
    * @param tableName
    * @return
    */
  def fastFindHiveTable(tableName: String) : Option[Result]

  /**
    * Load all tables from the cache
    * @return
    */
  def fastLoadAllTables:Seq[Result]


}
