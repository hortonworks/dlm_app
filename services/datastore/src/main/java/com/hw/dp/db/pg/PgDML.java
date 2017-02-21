package com.hw.dp.db.pg;

import com.hw.dp.db.BindJson;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.customizers.Define;
import org.skife.jdbi.v2.sqlobject.stringtemplate.UseStringTemplate3StatementLocator;

import java.util.Collection;


@UseStringTemplate3StatementLocator
public interface PgDML
{
  @SqlUpdate("insert into <collection> (json_value) values (:json_value)")
  void insertDocument(@Define("collection") String collection, @BindJson("json_value") String json_value) throws Exception;

  @SqlQuery("select json_value from <collection> where json_value @> '{\"<key>\":<value>}'")
  Collection<String> jsonByKey(@Define("collection") String collection, @Define("key") String key,@Define("value") Object value) throws Exception;

  @SqlQuery("select json_value from <collection> where json_value @> '{\"<key>\":\"<value>\"}'")
  Collection<String> jsonByKeyStrValue(@Define("collection") String collection, @Define("key") String key,@Define("value") Object value) throws Exception;



}