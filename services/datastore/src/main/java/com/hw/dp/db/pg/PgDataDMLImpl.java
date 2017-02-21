package com.hw.dp.db.pg;

import com.hw.dp.db.DBResult;
import com.hw.dp.db.DataStoreDML;
import org.skife.jdbi.v2.IDBI;

public class PgDataDMLImpl implements DataStoreDML {

  private final PgDML pgDao;

  public PgDataDMLImpl(IDBI dbi) {
    pgDao = dbi.open(PgDML.class);
  }

  @Override
  public DBResult insertDocument(String collection, String json) {
    try {
      pgDao.insertDocument(collection, json);
      return DBResult.success();
    } catch (Throwable e) {
      return DBResult.failure(e);
    }
  }

  @Override
  public DBResult searchByKeyValue(String collection, String key, Object value) {
    try {
      if (value instanceof String) {
        return DBResult.from(pgDao.jsonByKeyStrValue(collection, key, value));
      }
      return DBResult.from(pgDao.jsonByKey(collection, key, value));
    } catch (Throwable e) {
      return DBResult.failure(e);
    }
  }
}
