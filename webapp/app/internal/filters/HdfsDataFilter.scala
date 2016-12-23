package internal.filters

import javax.script.ScriptEngineManager

import com.hw.dp.services.hdfs.Hdfs.Result
import models.Filters.SearchQuery
import play.api.libs.json.{JsValue, Json}

import scala.util.Try

trait HdfsDataFilter {

  val engine = new ScriptEngineManager().getEngineByMimeType("text/javascript")
  def apply(data: Seq[Result]): Seq[Result]

  final def evaluate(r: JsValue, expression: String): Boolean = {
    engine.eval(s"var result = ${Json.stringify(r)}")
    val result = engine.eval(s"result.${expression}")
    Try(result.asInstanceOf[Boolean]) getOrElse false
  }

}

class HdfsFieldValueFilter(expression: String) extends HdfsDataFilter {

  override def apply(data: Seq[Result]): Seq[Result] = {
    data.filter { r: Result =>
      evaluate(Json.toJson(r), expression)
    }
  }
}

class HdfsFilterChain(val filters: Seq[HdfsDataFilter])
    extends HdfsDataFilter {
  override def apply(data: Seq[Result]): Seq[Result] = {
    filters.foldLeft(data)((b, a) => a.apply(b))
  }
}

object HdfsFilterChain {
  def apply(filters: Seq[HdfsDataFilter]): HdfsFilterChain = new HdfsFilterChain(filters)
  private val passThroughFilter = new HdfsDataFilter {
    override def apply(data: Seq[Result]) = data
  }

  final def makeFilterChain(searchQuery: SearchQuery):HdfsFilterChain = {
    val filters = searchQuery.predicates
    HdfsFilterChain(filters.map { f =>
      f.qualifier match {
        case "field" => new HdfsFieldValueFilter(f.predicate)
        case _ => passThroughFilter
      }
    })
  }

}

