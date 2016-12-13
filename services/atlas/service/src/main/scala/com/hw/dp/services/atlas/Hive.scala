package com.hw.dp.services.atlas

import play.api.libs.json.Json


object Hive {


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

  case class Parameters(
                         rawDataSize: Option[String],
                         numFiles: Option[String],
                         transient_lastDdlTime: Option[String],
                         totalSize: Option[String],
                         COLUMN_STATS_ACCURATE: Option[String],
                         numRows: Option[String]
                       )

  case class Column(
                      `$typeName$`: Option[String],
                      `$id$`: Option[Identifier],
                      `$systemAttributes$`: Option[SystemAttributes],
                      comment: Option[String],
                      qualifiedName: Option[String],
                      `type`: Option[String],
                      position: Option[Double],
                      owner: Option[String],
                      description: Option[String],
                      name: Option[String],
                      table: Option[Identifier]
                    )

  case class Result(
                      `$typeName$`: Option[String],
                      `$id$`: Option[Identifier],
                      `$systemAttributes$`: Option[SystemAttributes],
                      aliases: Option[String],
                      comment: Option[String],
                      retention: Option[Double],
                      parameters: Option[Parameters],
                      qualifiedName: Option[String],
                      partitionKeys: Option[String],
                      columns: Option[List[Column]],
                      viewOriginalText: Option[String],
                      owner: Option[String],
                      description: Option[String],
                      db: Option[Identifier],
                      name: Option[String],
                      temporary: Option[Boolean],
                      createTime: Option[String],
                      lastAccessTime: Option[String],
                      tableType: Option[String],
                      viewExpandedText: Option[String]
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

  case class SearchResult(
                           requestId: String,
                           query: String,
                           queryType: String,
                           count: Double,
                           results: Option[List[Result]],
                           dataType: DataType
                           )


  implicit val mutiplicityReads = Json.reads[Multiplicity]
  implicit val attributeDefinitionReads = Json.reads[AttributeDefinitions]
  implicit val dataTypeReads = Json.reads[DataType]
  implicit val systemAttributesReads = Json.reads[SystemAttributes]
  implicit val identifierReads = Json.reads[Identifier]
  implicit val columnReads = Json.reads[Column]
  implicit val parameterReads = Json.reads[Parameters]
  implicit val resultsReads = Json.reads[Result]
  implicit val resultReads = Json.reads[SearchResult]

  implicit val mutiplicityWrites = Json.writes[Multiplicity]
  implicit val attributeDefinitionWrites = Json.writes[AttributeDefinitions]
  implicit val dataTypeWrites = Json.writes[DataType]
  implicit val systemAttributesWrites = Json.writes[SystemAttributes]
  implicit val identifierWrites = Json.writes[Identifier]
  implicit val columnWrites = Json.writes[Column]
  implicit val parameterWrites = Json.writes[Parameters]
  implicit val resultsWrites = Json.writes[Result]
  implicit val resultWrites = Json.writes[SearchResult]
  implicit val lineageWrites = Json.writes[Lineage]


}
