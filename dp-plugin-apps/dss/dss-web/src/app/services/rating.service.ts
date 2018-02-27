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

import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {HttpUtil} from '../shared/utils/httpUtil';
import {Rating} from "../models/rating";
import {Subject} from "rxjs/Subject";

@Injectable()
export class RatingService implements OnDestroy, OnInit{
  uri = 'api/ratings';

  dataChanged = new Subject<number>();
  dataChanged$ = this.dataChanged.asObservable();

  constructor(private http:Http) { }

  ngOnInit(): void {
    this.dataChanged = new Subject<number>();
    this.dataChanged$ = this.dataChanged.asObservable();
  }

  get(objectId: string, objectType: string): Observable<Rating>  {
    const uri = `${this.uri}?objectId=${objectId}&objectType=${objectType}`;

    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(err => {
        if(err.status == 404) {
          return Observable.throw(err);
        }
        return HttpUtil.handleError(err)
      });
  }

  getAverage(objectId: string, objectType: string): Observable<any>  {
    const uri = `${this.uri}/actions/average?objectId=${objectId}&objectType=${objectType}`;

    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(err => {
        return HttpUtil.handleError(err)
      });
  }

  add(rating: Rating): Observable<Rating> {
    return this.http
      .post(`${this.uri}`, rating, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  update(rate: number, ratingId: number): Observable<Rating> {
    return this.http
      .patch(`${this.uri}/${ratingId}`, {"rating":rate}, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  ngOnDestroy() {
    this.dataChanged.unsubscribe();
    this.dataChanged = null;
    this.dataChanged$ = null;
  }
}
