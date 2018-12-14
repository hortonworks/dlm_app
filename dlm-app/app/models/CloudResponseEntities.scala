/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

package models

import models.ADLSEntities.{ADLSFileItem, ADLSFileListResponse}
import models.AmazonS3Entities.{S3FileItem, S3FileListResponse}
import models.CloudAccountProvider.CloudAccountProvider
import models.GCSEntities.{GcsFileListItem, GcsFileListResponse}
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

  implicit val gcsFileItemFmt = Json.format[GcsFileListItem]
  implicit val gcsFilesResponseFmt = Json.format[GcsFileListResponse]


  implicit val fileListResponseFmt: Format[FileListResponse] = new Format[FileListResponse] {
    def reads(json: JsValue): JsResult[FileListResponse] = {
      def from(name: CloudAccountProvider, data: JsObject): JsResult[FileListResponse] = name match {
        case CloudAccountProvider.AWS  => Json.fromJson[S3FileListResponse](data)(s3FileListResponseFmt)
        case CloudAccountProvider.WASB => Json.fromJson[BlobListResponse](data)(blobListResponseFmt)
        case CloudAccountProvider.ADLS => Json.fromJson[ADLSFileListResponse](data)(adlsFilesResponseFmt)
        case CloudAccountProvider.GCS => Json.fromJson[GcsFileListResponse](data)(gcsFilesResponseFmt)
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
        case data: GcsFileListResponse => Json.toJson(data)(gcsFilesResponseFmt)
      }
    }
  }

  implicit val mountPointDefinitionReads = Json.reads[MountPointDefinition]
  implicit val mountPointDefinitionWrites = Json.writes[MountPointDefinition]

  implicit val cloudMountPointsResponseReads = Json.reads[MountPointsResponse]
  implicit val cloudMountPointsResponseWrites = Json.writes[MountPointsResponse]
}
