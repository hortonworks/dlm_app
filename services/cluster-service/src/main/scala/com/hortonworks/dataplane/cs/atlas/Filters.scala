/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package com.hortonworks.dataplane.cs.atlas

import com.hortonworks.dataplane.commons.domain.Atlas.{
  AtlasFilter,
  AtlasSearchQuery
}

object Filters {

  private type Preprocessor = (AtlasFilter) => AtlasFilter

  private sealed case class Query(q: String)

  private val predicates = Seq(
    new StringEqualsPredicate(),
    new NonStringEqualsPredicate(),
    new LessThanPredicate(),
    new LessThanEqualsPredicate(),
    new GreaterThanPredicate(),
    new GreaterThanEqualsPredicate(),
    new NotEqualsPredicate(),
    new NotEqualsStringPredicate(),
    new StringContainsPredicate(),
    new StringStartsWithPredicate(),
    new StringEndsWithPredicate(),
    new TagEqualsWithPredicate()
  )

  def query(atlasFilters: AtlasSearchQuery, lowerCaseOperand: Boolean = true) = {
    val filters = atlasFilters.atlasFilters.map { af =>
      val toApply = predicates.find(p => p.isApplicable(af))
      toApply.map { ta =>
        ta.apply(af, { f =>
            if (lowerCaseOperand)
              f.copy(operand = af.operand.toLowerCase)
            else f
          })
          .q
      }
    }

    val filterList = filters.collect {
      case Some(str) => str
    }.toList

    // create a collection of 'where and ands'
    val fillers = "where" :: List.fill(filterList.size - 1)("and")
    // zip them together
    val zipped = intersperse(fillers, filterList)
    zipped.mkString(" ")

  }

  private def intersperse[A](a: List[A], b: List[A]): List[A] = a match {
    case first :: rest => first :: intersperse(b, rest)
    case _             => b
  }

  private sealed trait Predicate {

    def isApplicable(atlasFilter: AtlasFilter): Boolean

    protected def apply(atlasFilter: AtlasFilter): Query

    def apply(atlasFilter: AtlasFilter, preProcess: Preprocessor): Query = {
      apply(preProcess(atlasFilter))
    }
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
      val dataType = atlasFilter.atlasAttribute.dataType
      dataType != "string" && dataType != "tag" && atlasFilter.operation == "equals"
    }
  }

  private class LessThanPredicate extends Predicate {
    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(s"${atlasFilter.atlasAttribute.name}<${atlasFilter.operand}")
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

  private class StringContainsPredicate extends Predicate {

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      val dataType = atlasFilter.atlasAttribute.dataType
      dataType == "string" && atlasFilter.operation == "contains"
    }

    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(
        s"${atlasFilter.atlasAttribute.name} like '*${atlasFilter.operand}*'")
    }
  }

  private class StringStartsWithPredicate extends Predicate {

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      val dataType = atlasFilter.atlasAttribute.dataType
      dataType == "string" && atlasFilter.operation == "startsWith"
    }

    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(
        s"${atlasFilter.atlasAttribute.name} like '${atlasFilter.operand}*'")
    }
  }

  private class StringEndsWithPredicate extends Predicate {

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      val dataType = atlasFilter.atlasAttribute.dataType
      dataType == "string" && atlasFilter.operation == "endsWith"
    }

    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(
        s"${atlasFilter.atlasAttribute.name} like '*${atlasFilter.operand}'")
    }
  }

  private class TagEqualsWithPredicate extends Predicate {

    override def isApplicable(atlasFilter: AtlasFilter): Boolean = {
      val dataType = atlasFilter.atlasAttribute.dataType
      dataType == "tag" && atlasFilter.operation == "equals"
    }

    override def apply(atlasFilter: AtlasFilter): Query = {
      Query(s"hive_table isa ${atlasFilter.operand}")
    }
  }

}
