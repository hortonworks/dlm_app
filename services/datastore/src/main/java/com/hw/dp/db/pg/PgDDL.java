package com.hw.dp.db.pg;

import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.customizers.Define;
import org.skife.jdbi.v2.sqlobject.stringtemplate.UseStringTemplate3StatementLocator;


@UseStringTemplate3StatementLocator
public interface PgDDL
{
  @SqlUpdate("CREATE TABLE <collection> (document_id BIGSERIAL PRIMARY KEY, json_value JSONB)")
  void createCollectionTable(@Define("collection") String collection) throws Exception;

  @SqlUpdate("DROP TABLE <collection>")
  void deleteCollectionTable(@Define("collection") String collection) throws Exception;

}