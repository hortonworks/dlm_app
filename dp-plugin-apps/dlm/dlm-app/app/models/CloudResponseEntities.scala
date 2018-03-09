/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package models

import models.ADLSEntities.{ADLSFileItem, ADLSFileListResponse}
import models.AmazonS3Entities.{S3FileItem, S3FileListResponse}
import models.CloudAccountProvider.CloudAccountProvider
import models.WASBEntities.{BlobListItem, BlobListResponse}
import play.api.libs.json._

object CloudResponseEntities {
  trait FileListItem {
    def pathSuffix: String
    def `type`: String
    def length: Option[Long]
    def modificationTime: Option[Long]
  }

  trait FileListResponse {
    def provider: CloudAccountProvider
    def fileList: Seq[FileListItem]
  }


  case class MountPointDefinition(name: String)
  case class MountPointsResponse(items: Seq[MountPointDefinition])


  implicit val s3FileItemFmt = Json.format[S3FileItem]
  implicit val s3FileListResponseFmt = Json.format[S3FileListResponse]

  implicit val blobListItemFmt = Json.format[BlobListItem]
  implicit val blobListResponseFmt = Json.format[BlobListResponse]

  implicit val adlsFileItemFmt = Json.format[ADLSFileItem]
  implicit val adlsFilesResponseFmt = Json.format[ADLSFileListResponse]


  implicit val fileListResponseFmt: Format[FileListResponse] = new Format[FileListResponse] {
    def reads(json: JsValue): JsResult[FileListResponse] = {
      def from(name: CloudAccountProvider, data: JsObject): JsResult[FileListResponse] = name match {
        case CloudAccountProvider.AWS  => Json.fromJson[S3FileListResponse](data)(s3FileListResponseFmt)
        case CloudAccountProvider.WASB => Json.fromJson[BlobListResponse](data)(blobListResponseFmt)
        case CloudAccountProvider.ADLS => Json.fromJson[ADLSFileListResponse](data)(adlsFilesResponseFmt)
        case _      => JsError(s"Unknown provider '$name'")
      }

      for {
        name <- (json \ "provider").validate[CloudAccountProvider]
        data <- json.validate[JsObject]
        result <- from(name, data)
      } yield result
    }

    def writes(fileListResponse: FileListResponse): JsValue = {
      fileListResponse match {
        case data: S3FileListResponse => Json.toJson(data)(s3FileListResponseFmt)
        case data: BlobListResponse => Json.toJson(data)(blobListResponseFmt)
        case data: ADLSFileListResponse => Json.toJson(data)(adlsFilesResponseFmt)
      }
    }
  }

  implicit val mountPointDefinitionReads = Json.reads[MountPointDefinition]
  implicit val mountPointDefinitionWrites = Json.writes[MountPointDefinition]

  implicit val cloudMountPointsResponseReads = Json.reads[MountPointsResponse]
  implicit val cloudMountPointsResponseWrites = Json.writes[MountPointsResponse]
}
