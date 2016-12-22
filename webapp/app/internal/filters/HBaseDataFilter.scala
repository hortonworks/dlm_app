package internal.filters

import javax.script.ScriptEngineManager

import com.hw.dp.services.hbase.HBase.Result
import models.Filters.SearchQuery
import play.api.libs.json.{JsValue, Json}

import scala.util.Try

trait HbaseDataFilter {

  val engine = new ScriptEngineManager().getEngineByMimeType("text/javascript")
  def apply(data: Seq[Result]): Seq[Result]

  final def evaluate(r: JsValue, expression: String): Boolean = {
    engine.eval(s"var result = ${Json.stringify(r)}")
    val result = engine.eval(s"result.${expression}")
    Try(result.asInstanceOf[Boolean]) getOrElse false
  }

}

class HbaseColumnFieldFilter(expression: String) extends HbaseDataFilter {
  override def apply(data: Seq[Result]): Seq[Result] = {
    data.filter { r =>
      r.columns.isDefined && r.columns.get
        .find(c => evaluate(Json.toJson(c), expression))
        .isDefined
    }
  }
}

class HbaseColumnParameterFilter(expression: String) extends HbaseDataFilter {
  override def apply(data: Seq[Result]): Seq[Result] = {
    data.filter { r =>
      r.columns.isDefined && r.columns.get
        .find(
          c =>
            c.$systemAttributes$.isDefined && evaluate(
              Json.toJson(c.$systemAttributes$.get),
              expression))
        .isDefined

    }
  }
}

class HbaseFieldValueFilter(expression: String) extends HbaseDataFilter {

  override def apply(data: Seq[Result]): Seq[Result] = {
    data.filter { r: Result =>
      evaluate(Json.toJson(r), expression)
    }
  }
}

class HbaseFilterChain(val filters: Seq[HbaseDataFilter])
    extends HbaseDataFilter {
  override def apply(data: Seq[Result]): Seq[Result] = {
    filters.foldLeft(data)((b, a) => a.apply(b))
  }
}

object HbaseFilterChain {
  def apply(filters: Seq[HbaseDataFilter]): HbaseFilterChain = new HbaseFilterChain(filters)
  private val passThroughFilter = new HbaseDataFilter {
    override def apply(data: Seq[Result]) = data
  }

  final def makeFilterChain(searchQuery: SearchQuery):HbaseFilterChain = {
    val filters = searchQuery.predicates
    HbaseFilterChain(filters.map { f =>
      f.qualifier match {
        case "column" => new HbaseColumnFieldFilter(f.predicate)
        case "columnAttribute" => new HbaseColumnParameterFilter(f.predicate)
        case "field" => new HbaseFieldValueFilter(f.predicate)
        case _ => passThroughFilter
      }
    })
  }

}

