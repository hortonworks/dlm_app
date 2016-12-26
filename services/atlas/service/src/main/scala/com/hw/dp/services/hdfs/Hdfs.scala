package com.hw.dp.services.hdfs

import play.api.libs.json.Json

object Hdfs {

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
  case class FileSetTypeDetails(
      compressed: Option[String],
      `directory-uri-pattern`: Option[String]
  )
  case class Result(
      `$typeName$`: Option[String],
      `$id$`: Option[Identifier],
      `$systemAttributes$`: Option[SystemAttributes],
      fileSetTypeDetails: Option[FileSetTypeDetails],
      count: Option[Double],
      qualifiedName: Option[String],
      fileSetContentFeatues: Option[Map[String,String]],
      accessTimeStamp: Option[String],
      fileSetType: Option[String],
      fileSetElements: Option[List[Identifier]],
      owner: Option[String],
      modificationTimeStamp: Option[String],
      description: Option[String],
      size: Option[Double],
      name: Option[String]
  )
  case class Multiplicity(
      lower: Double,
      upper: Double,
      isUnique: Boolean
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
  case class FileSetResult(
      requestId: String,
      query: String,
      queryType: String,
      count: Double,
      results: Option[List[Result]],
      dataType: Option[DataType]
  )

  implicit val mutiplicityReads = Json.reads[Multiplicity]
  implicit val fileSetTypeReads = Json.reads[FileSetTypeDetails]
  implicit val attributeDefinitionReads = Json.reads[AttributeDefinitions]
  implicit val dataTypeReads = Json.reads[DataType]
  implicit val systemAttributesReads = Json.reads[SystemAttributes]
  implicit val identifierReads = Json.reads[Identifier]
  implicit val resultsReads = Json.reads[Result]
  implicit val resultReads = Json.reads[FileSetResult]

  implicit val mutiplicityWrites = Json.writes[Multiplicity]
  implicit val fileSetTypeWrites = Json.writes[FileSetTypeDetails]
  implicit val attributeDefinitionWrites = Json.writes[AttributeDefinitions]
  implicit val dataTypeWrites = Json.writes[DataType]
  implicit val systemAttributesWrites = Json.writes[SystemAttributes]
  implicit val identifierWrites = Json.writes[Identifier]
  implicit val resultsWrites = Json.writes[Result]
  implicit val resultWrites = Json.writes[FileSetResult]

}
