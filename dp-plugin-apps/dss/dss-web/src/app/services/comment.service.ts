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

import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {HttpUtil} from '../shared/utils/httpUtil';
import {Comment, CommentWithUser} from "../models/comment";

@Injectable()
export class CommentService {
  uri = 'api/comments';
  constructor(private http:Http) { }

  getByObjectRef(objectId: string, objectType: string, offset:number, size:number): Observable<CommentWithUser[]>  {
    const uri = `${this.uri}?objectId=${objectId}&objectType=${objectType}&offset=${offset}&size=${size}`;

    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getByParentId(parentCommentId): Observable<CommentWithUser[]>  {
    const uri = `${this.uri}/${parentCommentId}/replies`;

    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  add(comment: Comment): Observable<Comment> {
    return this.http
      .post(`${this.uri}`, comment, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  deleteComment(id: number) : Observable<any> {
    return this.http
      .delete(`${this.uri}/${id}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
