package com.hw.dp.db;

import java.io.Closeable;

public interface DataStoreDDL extends Closeable {

  DBResult createCollection(String name);

  DBResult dropCollection(String name);

}

