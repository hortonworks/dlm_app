package internal.filters

import javax.script.ScriptEngineManager

import com.hw.dp.services.atlas.Hive.Result
import models.Filters.SearchQuery
import play.api.libs.json.{JsValue, Json}

import scala.util.Try





trait HiveDataFilter {

  val engine = new ScriptEngineManager().getEngineByMimeType("text/javascript")
  def apply(data: Seq[Result]): Seq[Result]

  final def evaluate(r: JsValue, expression: String): Boolean = {
    engine.eval(s"var result = ${Json.stringify(r)}")
    val result = engine.eval(s"result.${expression}")
    Try(result.asInstanceOf[Boolean]) getOrElse false
  }

}

import com.hw.dp.services.atlas.Hive._

class HiveColumnFieldFilter(expression:String) extends HiveDataFilter{
  override def apply(data: Seq[Result]): Seq[Result] = {
      data.filter { r =>
        r.columns.isDefined && r.columns.get.find(c => evaluate(Json.toJson(c),expression)).isDefined
      }
  }
}


class HiveColumnParameterFilter(expression:String) extends HiveDataFilter{
  override def apply(data: Seq[Result]): Seq[Result] = {
    data.filter { r =>
      r.columns.isDefined && r.columns.get.find(c => c.$systemAttributes$.isDefined && evaluate(Json.toJson(c.$systemAttributes$.get),expression)).isDefined

    }
  }
}


class HiveFieldValueFilter(expression: String) extends HiveDataFilter {

  override def apply(data: Seq[Result]): Seq[Result] = {
    data.filter { r: Result =>
      evaluate(Json.toJson(r), expression)
    }
  }
}


class HiveFilterChain(val filters:Seq[HiveDataFilter]) extends HiveDataFilter{
  override def apply(data: Seq[Result]): Seq[Result] = {
    filters.foldLeft(data)((b,a) => a.apply(b))
  }
}

object HiveFilterChain {
  def apply(filters: Seq[HiveDataFilter]): HiveFilterChain = new HiveFilterChain(filters)

  private val passThroughFilter = new HiveDataFilter {
    override def apply(data: Seq[Result]) = data
  }

  final def makeFilterChain(searchQuery: SearchQuery):HiveFilterChain = {
    val filters = searchQuery.predicates
    HiveFilterChain(filters.map { f =>
      f.qualifier match {
        case "column" => new HiveColumnFieldFilter(f.predicate)
        case "columnAttribute" => new HiveColumnParameterFilter(f.predicate)
        case "field" => new HiveFieldValueFilter(f.predicate)
        case _ => passThroughFilter
      }
    })
  }

}


object Runner extends App {

  val r = "{\n  \"$typeName$\": \"hive_table\",\n  \"$id$\": {\n    \"id\": \"ab9bd320-5d0a-49fd-85ea-f8622e493aec\",\n    \"$typeName$\": \"hive_table\",\n    \"version\": 0,\n    \"state\": \"ACTIVE\"\n  },\n  \"$systemAttributes$\": {\n    \"createdBy\": \"admin\",\n    \"modifiedBy\": \"admin\",\n    \"createdTime\": \"Mon Dec 12 22:29:23 UTC 2016\",\n    \"modifiedTime\": \"Mon Dec 12 22:29:23 UTC 2016\"\n  },\n  \"retention\": 0,\n  \"parameters\": {\n    \"rawDataSize\": \"0\",\n    \"numFiles\": \"0\",\n    \"transient_lastDdlTime\": \"1481581610\",\n    \"totalSize\": \"0\",\n    \"COLUMN_STATS_ACCURATE\": \"{\\\"BASIC_STATS\\\":\\\"true\\\"}\",\n    \"numRows\": \"0\"\n  },\n  \"qualifiedName\": \"default.test15@test\",\n  \"columns\": [\n    {\n      \"$typeName$\": \"hive_column\",\n      \"$id$\": {\n        \"id\": \"af310911-45c4-46b2-a189-da2fffa9d592\",\n        \"$typeName$\": \"hive_column\",\n        \"version\": 0,\n        \"state\": \"ACTIVE\"\n      },\n      \"$systemAttributes$\": {\n        \"createdBy\": \"admin\",\n        \"modifiedBy\": \"admin\",\n        \"createdTime\": \"Mon Dec 12 22:29:23 UTC 2016\",\n        \"modifiedTime\": \"Mon Dec 12 22:29:23 UTC 2016\"\n      },\n      \"qualifiedName\": \"default.test15.name@test\",\n      \"type\": \"string\",\n      \"position\": 0,\n      \"owner\": \"admin\",\n      \"name\": \"name\",\n      \"table\": {\n        \"id\": \"ab9bd320-5d0a-49fd-85ea-f8622e493aec\",\n        \"$typeName$\": \"hive_table\",\n        \"version\": 0,\n        \"state\": \"ACTIVE\"\n      }\n    }\n  ],\n  \"owner\": \"admin\",\n  \"db\": {\n    \"id\": \"0ed466a0-59df-47e6-9e65-c3d9930a445b\",\n    \"$typeName$\": \"hive_db\",\n    \"version\": 0,\n    \"state\": \"ACTIVE\"\n  },\n  \"name\": \"test15\",\n  \"temporary\": false,\n  \"createTime\": \"2016-12-12T22:26:50.000Z\",\n  \"lastAccessTime\": \"2016-12-12T22:26:50.000Z\",\n  \"tableType\": \"MANAGED_TABLE\"\n}"

  val f1 = new HiveColumnParameterFilter("createdBy === 'admin'")
  val f2 = new HiveColumnParameterFilter("modifiedBy === 'admin'")
  val f3 = new HiveFieldValueFilter("name === 'test15'")

  val res = Json.parse(r).as[Result]

  println(new HiveFilterChain(Seq(f1,f2,f3)).apply(Seq(res)))

}

