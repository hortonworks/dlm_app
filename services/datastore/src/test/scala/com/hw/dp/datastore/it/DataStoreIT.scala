package com.hw.dp.datastore.it

import com.hw.dp.db.pg.{PgDataDDLImpl, PgDataDMLImpl}
import org.scalatest.{BeforeAndAfterAll, FlatSpec, Matchers}
import org.skife.jdbi.v2.DBI


class DataStoreIT extends FlatSpec with Matchers with EmbeddedPgSupport with BeforeAndAfterAll{

  "The datastore" should "create a PG table" in {

    implicit val dbi = new DBI(url)
    val storeImpl = new PgDataDDLImpl(dbi)
    val res = storeImpl.createCollection("datasets")

    import PgExtensions._
    "datasets".existsInDb equals true

  }


  it should "drop a PG table" in {

    implicit val dbi = new DBI(url)
    val storeImpl = new PgDataDDLImpl(dbi)
    storeImpl.createCollection("datasets")
    import PgExtensions._
    "datasets".existsInDb equals true
    storeImpl.dropCollection("datasets")
    "datasets".existsInDb equals false

  }

 it should "insert a Json document" in {
   implicit val dbi = new DBI(url)
   val storeImpl = new PgDataDMLImpl(dbi)
   val ddl = new PgDataDDLImpl(dbi)
   ddl.createCollection("datasets")
   storeImpl.insertDocument("datasets","""{"name":"test"}""")
   import PgExtensions._
   "datasets".existsInDb equals true
   "datasets".tableSize equals 1
   ddl.dropCollection("datasets")
   "datasets".existsInDb equals false
 }


  it should "search for a Json document by key and value is string" in {

    implicit val dbi = new DBI(url)
    val storeImpl = new PgDataDMLImpl(dbi)
    val ddl = new PgDataDDLImpl(dbi)
    ddl.createCollection("datasets")

    (1 to 10).foreach { num =>
      storeImpl.insertDocument("datasets","""{"name":"test"}""")
    }

    import PgExtensions._
    "datasets".existsInDb equals true
    "datasets".tableSize should be (10)

    val dBResult = storeImpl.searchByKeyValue("datasets","name","test")
    dBResult.getResults.get().size() should be (10)
    ddl.dropCollection("datasets")
    "datasets".existsInDb equals false

  }

  it should "search for a Json document by key and value is a number" in {

    implicit val dbi = new DBI(url)
    val storeImpl = new PgDataDMLImpl(dbi)
    val ddl = new PgDataDDLImpl(dbi)
    ddl.createCollection("datasets1")

    (1 to 10).foreach { num =>
      storeImpl.insertDocument("datasets1","""{"quantity":2}""")
    }

    import PgExtensions._
    "datasets1".existsInDb equals true
    "datasets1".tableSize should be (10)

    val dBResult = storeImpl.searchByKeyValue("datasets1","quantity",2)
    dBResult.getResults.get().size() should be (10)
    ddl.dropCollection("datasets1")
    "datasets1".existsInDb equals false

  }

  it should "search for a Json document by key and value is a boolean" in {

    implicit val dbi = new DBI(url)
    val storeImpl = new PgDataDMLImpl(dbi)
    val ddl = new PgDataDDLImpl(dbi)
    ddl.createCollection("datasets2")

    (1 to 10).foreach { num =>
      storeImpl.insertDocument("datasets2","""{"exists":true}""")
    }

    import PgExtensions._
    "datasets2".existsInDb equals true
    "datasets2".tableSize should be (10)

    val dBResult = storeImpl.searchByKeyValue("datasets2","exists",true)
    dBResult.getResults.get().size() should be (10)
    ddl.dropCollection("datasets2")
    "datasets2".existsInDb equals false

  }




  override def afterAll(): Unit = {
    stop
  }






}
