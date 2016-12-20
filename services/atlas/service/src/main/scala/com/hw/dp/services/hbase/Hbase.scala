package com.hw.dp.services.hbase

import play.api.libs.json.Json

object HBase {

  case class Identifier(
      id: Option[String],
      `$typeName$`: Option[String],
      version: Option[Double],
      state: Option[String]
  )

  case class SystemAttributes(
      createdBy: Option[String],
      modifiedBy: Option[String],
      createdTime: Option[String],
      modifiedTime: Option[String]
  )

  case class Columns(
      `$typeName$`: Option[String],
      `$id$`: Option[Identifier],
      `$systemAttributes$`: Option[SystemAttributes],
      qualifiedName: Option[String],
      columnFamily: Option[String],
      owner: Option[String],
      description: Option[String],
      name: Option[String],
      dataType: Option[String]
  )

  case class Result(
      `$typeName$`: Option[String],
      `$id$`: Option[Identifier],
      `$systemAttributes$`: Option[SystemAttributes],
      qualifiedName: Option[String],
      columns: Option[List[Columns]],
      owner: Option[String],
      description: Option[String],
      name: Option[String]
  )

  case class Multiplicity(
      lower: Option[Double],
      upper: Option[Double],
      isUnique: Option[Boolean]
  )

  case class AttributeDefinitions(
      name: Option[String],
      dataTypeName: Option[String],
      multiplicity: Option[Multiplicity],
      isComposite: Option[Boolean],
      isUnique: Option[Boolean],
      isIndexable: Option[Boolean],
      reverseAttributeName: Option[String]
  )

  case class DataType(
      superTypes: Option[List[String]],
      hierarchicalMetaTypeName: Option[String],
      typeName: Option[String],
      typeDescription: Option[String],
      typeVersion: Option[String],
      attributeDefinitions: Option[List[AttributeDefinitions]]
  )

  case class PhoenixSearchResult(
      requestId: String,
      query: String,
      queryType: String,
      count: Double,
      results: Option[List[Result]],
      dataType: Option[DataType]
  )

  implicit val mutiplicityReads = Json.reads[Multiplicity]
  implicit val attributeDefinitionReads = Json.reads[AttributeDefinitions]
  implicit val dataTypeReads = Json.reads[DataType]
  implicit val systemAttributesReads = Json.reads[SystemAttributes]
  implicit val identifierReads = Json.reads[Identifier]
  implicit val columnReads = Json.reads[Columns]
  implicit val resultsReads = Json.reads[Result]
  implicit val resultReads = Json.reads[PhoenixSearchResult]

  implicit val mutiplicityWrites = Json.writes[Multiplicity]
  implicit val attributeDefinitionWrites = Json.writes[AttributeDefinitions]
  implicit val dataTypeWrites = Json.writes[DataType]
  implicit val systemAttributesWrites = Json.writes[SystemAttributes]
  implicit val identifierWrites = Json.writes[Identifier]
  implicit val columnWrites = Json.writes[Columns]
  implicit val resultsWrites = Json.writes[Result]
  implicit val resultWrites = Json.writes[PhoenixSearchResult]



}
