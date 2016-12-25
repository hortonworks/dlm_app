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
    engine.eval(s"var r = ${Json.stringify(r)}")
    val result = engine.eval(expression)
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


