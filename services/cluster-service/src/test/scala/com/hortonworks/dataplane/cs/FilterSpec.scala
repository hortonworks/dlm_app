package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Atlas.{
  AtlasAttribute,
  AtlasFilter,
  AtlasFilters
}
import com.hortonworks.dataplane.cs.atlas.Filters
import org.scalatest._

class FilterSpec extends FlatSpec with Matchers {

  "Filters" should "construct a DSL query based on a single input" in {

    val output = Filters.query(AtlasFilters(
      Seq(AtlasFilter(AtlasAttribute("owner", "string"), "equals", "admin"))))

    assert(output == "WHERE owner='admin'")

  }


  it should "construct a DSL query by combining 2 filters as AND" in {

    val output = Filters.query(AtlasFilters(
      Seq(AtlasFilter(AtlasAttribute("owner", "string"), "equals", "admin"),
        AtlasFilter(AtlasAttribute("name", "string"), "equals", "trucks"))))

    assert(output == "WHERE owner='admin' AND name='trucks'")

  }

  it should "construct a DSL query by combining more than 2 filters as AND" in {

    val output = Filters.query(AtlasFilters(
      Seq(AtlasFilter(AtlasAttribute("owner", "string"), "equals", "admin"),
        AtlasFilter(AtlasAttribute("name", "string"), "equals", "trucks"),
        AtlasFilter(AtlasAttribute("created", "date"), "gte", "21-01-2017"))))

    assert(output == "WHERE owner='admin' AND name='trucks' AND created>=21-01-2017")

  }


  it should "construct DSL queries for non string equalities" in {
    val output = Filters.query(AtlasFilters(
      Seq(AtlasFilter(AtlasAttribute("owner", "string"), "equals", "admin"),
        AtlasFilter(AtlasAttribute("temporary", "boolean"), "equals", "false"))))

    assert(output == "WHERE owner='admin' AND temporary=false")
  }

}
