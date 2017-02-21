package com.hw.dp.datastore

import java.sql.SQLException

import com.hw.dp.db.pg.{PgDDL, PgDataDDLImpl}
import org.easymock.EasyMock._
import org.scalatest.easymock.EasyMockSugar
import org.scalatest.{FlatSpec, Matchers}
import org.skife.jdbi.v2.IDBI

class DataStoreDDLSpec extends FlatSpec with Matchers with EasyMockSugar {



  "The datastore" should "create a table successfully" in {
    val idbi = mock[IDBI]
    val pgDao = mock[PgDDL]
    idbi.open(classOf[PgDDL]).andReturn(pgDao).once()
    pgDao.createCollectionTable("datasets").once()
    replay(idbi,pgDao)
    val storeImpl = new PgDataDDLImpl(idbi)
    val dBResult = storeImpl.createCollection("datasets")
    dBResult.isSuccessful equals true
    verify(idbi,pgDao)
  }

  it should "delete a collection" in {
    val idbi = mock[IDBI]
    val pgDao = mock[PgDDL]
    idbi.open(classOf[PgDDL]).andReturn(pgDao).once()
    pgDao.deleteCollectionTable("datasets").andThrow(new SQLException("E001"))
    replay(idbi,pgDao)
    val storeImpl = new PgDataDDLImpl(idbi)
    val dBResult = storeImpl.dropCollection("datasets")
    dBResult.isSuccessful equals false
    dBResult.getError.getMessage equals "E001"
    verify(idbi,pgDao)
  }


  it should "return a failed DB result if underlying storage throws an exception" in {
    val idbi = mock[IDBI]
    val pgDao = mock[PgDDL]
    idbi.open(classOf[PgDDL]).andReturn(pgDao).once()
    pgDao.createCollectionTable("datasets").andThrow(new SQLException("E001"))
    replay(idbi,pgDao)
    val storeImpl = new PgDataDDLImpl(idbi)
    val dBResult = storeImpl.createCollection("datasets")
    dBResult.isSuccessful equals false
    dBResult.getError.getMessage equals "E001"
    verify(idbi,pgDao)
  }

}
