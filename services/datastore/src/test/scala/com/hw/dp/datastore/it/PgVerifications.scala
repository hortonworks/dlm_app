package com.hw.dp.datastore.it

import org.skife.jdbi.v2.{DBI, Handle}


object PgExtensions {

  class Table(val name:String,dbi:DBI) {
      def existsInDb = {
        val h = dbi.open()
        val result = h.select(
          s"""SELECT EXISTS (
   SELECT 1
   FROM   information_schema.tables
   WHERE  table_schema = 'public'
   AND    table_name = '${name}'
   );""")
        val res = result.get(0).get("exists")
        res == true
      }

     def tableSize = {
       val h = dbi.open()
       val result = h.select(s"""SELECT count(*) from ${name}""")
       val res = result.get(0).get("count")
       res.asInstanceOf[Long]
     }

  }


  implicit def richTable(name: String)(implicit dbi:DBI) = new Table(name,dbi)
}






