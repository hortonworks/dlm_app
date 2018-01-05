/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package models

import play.api.libs.json.Json

object WASBEntities {
  case class ClientCredentials(accountName: String, accessKey: String, protocol: String = "http")
  case class WASBClientError(error: String)
  case class BlobListItem(pathSuffix: String, `type`: String, modificationTime: Option[Long], length: Option[Long])
  case class BlobListResponse(fileList: Seq[BlobListItem])
  case class MountPointDefinition(name: String)
  case class MountPointsResponse(items: Seq[MountPointDefinition])

  implicit val wasbClientErrorWrites = Json.writes[WASBClientError]
  implicit val wasbClientErrorReads = Json.reads[WASBClientError]

  implicit val blobListItemWrites = Json.writes[BlobListItem]
  implicit val blobListItemReads = Json.reads[BlobListItem]

  implicit val blobListResponseWrites = Json.writes[BlobListResponse]
  implicit val blobListResponseReads = Json.reads[BlobListResponse]

  implicit val cloudMountPointDefinitionReads = Json.reads[MountPointDefinition]
  implicit val cloudMountPointDefinitionWrites = Json.writes[MountPointDefinition]

  implicit val cloudMountPointsResponseReads = Json.reads[MountPointsResponse]
  implicit val cloudMountPointsResponseWrites = Json.writes[MountPointsResponse]
}

