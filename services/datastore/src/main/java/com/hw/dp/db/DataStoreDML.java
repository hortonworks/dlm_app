package com.hw.dp.db;

public interface DataStoreDML {

  DBResult insertDocument(String collection,String json);

  DBResult searchByKeyValue(String collection,String key,Object value);

}

