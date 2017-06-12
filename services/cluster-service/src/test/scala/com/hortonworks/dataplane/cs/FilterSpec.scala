package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Atlas.{
  AtlasAttribute,
  AtlasFilter,
  AtlasSearchQuery
}
import com.hortonworks.dataplane.cs.atlas.Filters
import org.scalatest._

class FilterSpec extends FlatSpec with Matchers {

  "Filters" should "construct a DSL query based on a single input" in {

    val output = Filters.query(AtlasSearchQuery(
      Seq(AtlasFilter(AtlasAttribute("owner", "string"), "equals", "admin"))))

    assert(output == "where owner='admin'")

  }


  it should "construct a DSL query by combining 2 filters as AND" in {

    val output = Filters.query(AtlasSearchQuery(
      Seq(AtlasFilter(AtlasAttribute("owner", "string"), "equals", "admin"),
        AtlasFilter(AtlasAttribute("name", "string"), "equals", "trucks"))))

    assert(output == "where owner='admin' and name='trucks'")

  }

  it should "construct a DSL query by combining more than 2 filters as AND" in {

    val output = Filters.query(AtlasSearchQuery(
      Seq(AtlasFilter(AtlasAttribute("owner", "string"), "equals", "admin"),
        AtlasFilter(AtlasAttribute("name", "string"), "equals", "trucks"),
        AtlasFilter(AtlasAttribute("created", "date"), "gte", "21-01-2017"))))

    assert(output == "where owner='admin' and name='trucks' and created>=21-01-2017")

  }


  it should "construct DSL queries for non string equalities" in {
    val output = Filters.query(AtlasSearchQuery(
      Seq(AtlasFilter(AtlasAttribute("owner", "string"), "equals", "admin"),
        AtlasFilter(AtlasAttribute("temporary", "boolean"), "equals", "false"))))

    assert(output == "where owner='admin' and temporary=false")
  }


  it should "construct DSL queries for partial String matches" in {
    val output = Filters.query(AtlasSearchQuery(
      Seq(AtlasFilter(AtlasAttribute("owner", "string"), "contains", "dmi"),AtlasFilter(AtlasAttribute("owner", "string"), "startsWith", "adm"),AtlasFilter(AtlasAttribute("owner", "string"), "endsWith", "min"),
        AtlasFilter(AtlasAttribute("temporary", "boolean"), "equals", "false"))))

    assert(output == "where owner like '*dmi*' and owner like 'adm*' and owner like '*min' and temporary=false")
  }

}
