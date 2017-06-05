package com.hortonworks.dataplane.cs.atlas

import com.hortonworks.dataplane.commons.domain.Atlas.{
  AtlasFilter,
  AtlasSearchQuery
}

object Filters {

  private sealed case class Query(q: String)

  private val predicates = Seq(
    new StringEqualsPredicate(),
    new NonStringEqualsPredicate(),
    new LessThanPredicate(),
    new LessThanEqualsPredicate(),
    new GreaterThanPredicate(),
    new GreaterThanEqualsPredicate(),
    new NotEqualsPredicate(),
    new NotEqualsStringPredicate()
  )

  def query(atlasFilters: AtlasSearchQuery) = {

    val filters = atlasFilters.atlasFilters.map { af =>
      val toApply = predicates.find(p => p.isApplicable(af))
      toApply.map { ta =>
        ta.apply(af).q
      }
    }

    val filterList = filters.collect {
      case Some(str) => str
    }.toList

    // create a collection of 'where and ands'
    val fillers = "where" :: List.fill(filterList.size - 1)(
      "and")
    // zip them together
    val zipped  = intersperse(fillers,filterList)
    zipped.mkString(" ")

  }

  private def intersperse[A](a : List[A], b : List[A]): List[A] = a match {
    case first :: rest => first :: intersperse(b, rest)
    case _             => b
  }

  private sealed trait Predicate {

    def isApplicable(atlasFilter: AtlasFilter): Boolean

    def apply(atlasFilter: AtlasFilter): Query
  }

  private class StringEqualsPredicate extends Predicate {

    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(s"${atlasFilter.atlasAttribute.name}='${atlasFilter.operand}'")
    }

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      atlasFilter.atlasAttribute.dataType == "string" && atlasFilter.operation == "equals"
    }
  }

  private class NonStringEqualsPredicate extends Predicate {

    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(s"${atlasFilter.atlasAttribute.name}=${atlasFilter.operand}")
    }

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      atlasFilter.atlasAttribute.dataType != "string" && atlasFilter.operation == "equals"
    }
  }

  private class LessThanPredicate extends Predicate {
    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(s"${atlasFilter.atlasAttribute.name}<${atlasFilter.operand}" )
    }

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      val dataType = atlasFilter.atlasAttribute.dataType
      dataType != "string" && dataType != "boolean" && atlasFilter.operation == "lt"
    }
  }

  private class GreaterThanPredicate extends Predicate {
    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(s"${atlasFilter.atlasAttribute.name}>${atlasFilter.operand}")
    }

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      val dataType = atlasFilter.atlasAttribute.dataType
      dataType != "string" && dataType != "boolean" && atlasFilter.operation == "gt"
    }
  }

  private class GreaterThanEqualsPredicate extends Predicate {
    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(s"${atlasFilter.atlasAttribute.name}>=${atlasFilter.operand}")
    }

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      val dataType = atlasFilter.atlasAttribute.dataType
      dataType != "string" && dataType != "boolean" && atlasFilter.operation == "gte"
    }
  }

  private class LessThanEqualsPredicate extends Predicate {
    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(s"${atlasFilter.atlasAttribute.name}<=${atlasFilter.operand}")
    }

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      val dataType = atlasFilter.atlasAttribute.dataType
      dataType != "string" && dataType != "boolean" && atlasFilter.operation == "lte"
    }
  }

  private class NotEqualsPredicate extends Predicate {
    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(s"${atlasFilter.atlasAttribute.name}!=${atlasFilter.operand}")
    }

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      val dataType = atlasFilter.atlasAttribute.dataType
      dataType != "string" && atlasFilter.operation == "nte"
    }
  }

  private class NotEqualsStringPredicate extends Predicate {
    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(s"${atlasFilter.atlasAttribute.name}!='${atlasFilter.operand}'")
    }

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      val dataType = atlasFilter.atlasAttribute.dataType
      dataType == "string" && atlasFilter.operation == "nte"
    }
  }

}
