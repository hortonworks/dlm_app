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

import {Response, RequestOptionsArgs} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import {Headers} from '@angular/http';
import {Alerts} from './alerts';
import {AuthUtils} from './auth-utils';
import {Router} from '@angular/router';
import {CustomError} from "../../models/custom-error";

export const HEADER_CHALLENGE_HREF = 'X-Authenticate-Href';

export class HttpUtil {

  public static extractString(res: Response): string {
    let text: string = res.text();
    return text || '';
  }


  public static extractData(res: Response): any {
    let body = res.json();
    return body || {};
  }

  public static handleError(error: any) {
    if (error.status === 401) {
      const challengeAt = error.headers.get(HEADER_CHALLENGE_HREF);
      const redirectTo = `${window.location.protocol}//${window.location.host}/${challengeAt}`;
      if(window.location.href.startsWith(`${window.location.protocol}//${window.location.host}/sign-in`) === false) {
        window.location.href = `${redirectTo}?originalUrl=${window.location.href}`;
      }
      return Observable.throw(error);
    }

    if (error.status === 403) {
      AuthUtils.setValidUser(false);
      return Observable.throw(error);
    }

    if (error.status === 404) {
      window.location.href = AuthUtils.notExistsURL;
      return Observable.throw(error);
    }

    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
    let message;
    if (error._body) {
      let errorJSON = JSON.parse(error._body);
      if((Array.isArray(errorJSON.errors) && HttpUtil.isValidErrArray(errorJSON)) || (Array.isArray(errorJSON.errorsObj.errors) && HttpUtil.isValidErrArray(errorJSON.errorsObj))){
        let errObject = (Array.isArray(errorJSON.errors) ? errorJSON : errorJSON.errorsObj)
        message = HttpUtil.getMsgsFromErrArray(errObject);
      }else if(Array.isArray(errorJSON)){
        message = errorJSON.map(err => {return HttpUtil.truncateErrorMessage(err.message)}).join(', ')
      }else if(errorJSON.message){
        message = HttpUtil.truncateErrorMessage(errorJSON.message)
      }else if (errorJSON.errors){
        message = errorJSON.errors.map(err => {return HttpUtil.truncateErrorMessage(err.message)}).join(', ')
      }else {
        message = 'Error Occured while processing';
      }
      Alerts.showErrorMessage(message);
    }
    return Observable.throw(error);
  }

  private static isValidErrArray(errObject) {
    return errObject.errors[0] && errObject.errors[0].code && errObject.errors[0].errorType
  }
  private static getMsgsFromErrArray(errorObj){
    return errorObj.errors.filter(err => {return (err.code && err.errorType)}).map(err => {return HttpUtil.processErrorMessage(err)}).join(', ');
  }
  private static processErrorMessage(error:CustomError){
    if(error.code.length > 16){
      return error.code;
    }
    let errorMsg = error.code+"\n"+error.message;
    return HttpUtil.truncateErrorMessage(errorMsg);
  }

  private static truncateErrorMessage(errorMessage: String){
    if(errorMessage.length < 256){
      return errorMessage;
    }
    return errorMessage.substring(0,256);
  }

  public static getHeaders(): RequestOptionsArgs {
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      'X-Requested-With' : 'XMLHttpRequest'

    };
    return ({
      headers: new Headers(headers)
    });
  }
}
