package com.hw.dp.db.pg;


import com.hw.dp.db.DBResult;
import com.hw.dp.db.DataStoreDDL;
import org.skife.jdbi.v2.IDBI;

import java.io.IOException;

public class PgDataDDLImpl implements DataStoreDDL {

  private final PgDDL pgDao;
  private final IDBI dbi;

  public PgDataDDLImpl(IDBI dbi) {
    pgDao = dbi.open(PgDDL.class);
    this.dbi = dbi;
  }

  @Override
  public DBResult createCollection(String name) {
    try {
      pgDao.createCollectionTable(name);
      return DBResult.success();
    } catch (Throwable e) {
      return DBResult.failure(e);
    }
  }

  @Override
  public DBResult dropCollection(String name) {
    try {
      pgDao.deleteCollectionTable(name);
      return DBResult.success();
    } catch (Throwable e) {
      return DBResult.failure(e);
    }

  }

  @Override
  public void close() throws IOException {
    dbi.close(pgDao);
  }
}
