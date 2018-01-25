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

export class Comment {
  id: number;
  comment: string;
  objectType: string;
  objectId: number;
  createdBy: number;
  createdOn: string;
  parentCommentId: number;
  lastModified: string;
  editVersion: string;
}

export class CommentWithUser {
  comment: Comment;
  userName: string;
}

export class CommentWithUserAndChildren {
  commentWithUser: CommentWithUser;
  children: CommentWithUser[] = [];
}

export class ReplyParent {
  commentText: string;
  username: string;
  parentId: number;
}