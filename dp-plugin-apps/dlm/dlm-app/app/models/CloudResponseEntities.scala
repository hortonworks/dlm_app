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

object CloudResponseEntities {
  case class FileListItem(pathSuffix: String, `type`: String, length: Option[Long] = None, modificationTime: Option[Long] = None)
  case class FileListResponse(fileList: Seq[FileListItem])
  case class MountPointDefinition(name: String)
  case class MountPointsResponse(items: Seq[MountPointDefinition])

  implicit val fileListItemReads = Json.reads[FileListItem]
  implicit val fileListItemWrites = Json.writes[FileListItem]

  implicit val fileListResponseReads = Json.reads[FileListResponse]
  implicit val fileListResponseWrites = Json.writes[FileListResponse]

  implicit val mountPointDefinitionReads = Json.reads[MountPointDefinition]
  implicit val mountPointDefinitionWrites = Json.writes[MountPointDefinition]

  implicit val cloudMountPointsResponseReads = Json.reads[MountPointsResponse]
  implicit val cloudMountPointsResponseWrites = Json.writes[MountPointsResponse]
}
