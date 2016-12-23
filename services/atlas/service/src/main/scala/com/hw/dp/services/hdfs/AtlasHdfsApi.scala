package com.hw.dp.services.hdfs

import com.hw.dp.services.atlas.Atlas
import com.hw.dp.services.hdfs.Hdfs.{FileSetResult, Result}
import play.api.libs.json.JsValue

import scala.concurrent.Future
import scala.util.Try


trait AtlasHdfsApi {

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


  def fastLoadAllFileSets : Seq[Result]


  /**
    * Load all file sets by connecting over Atlas
    * @return
    */
  def loadAllFileSets:Try[FileSetResult]



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
