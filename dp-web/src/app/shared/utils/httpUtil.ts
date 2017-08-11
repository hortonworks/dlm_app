import {Response, RequestOptionsArgs} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import {Headers} from '@angular/http';
import {Alerts} from './alerts';
import {AuthUtils} from './auth-utils';
import {Router} from '@angular/router';
export class HttpUtil {
  static router: Router;

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
      window.location.href = AuthUtils.signoutURL;
      return Observable.throw(error);
    }

    if (error.status === 403) {
      AuthUtils.setValidUser(false);
      return Observable.throw(error);
    }

    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
    let message;
    if (error._body) {
      let errorJSON = JSON.parse(error._body);
      if(Array.isArray(errorJSON)){
        message = errorJSON.map(err => {return err.message}).join(', ')
      }else if(errorJSON.message){
        message = errorJSON.message
      }else if (errorJSON.errors){
        message = errorJSON.errors.map(err => {return err.message}).join(', ')
      }else {
        message = 'Error Occured while processing';
      }
      Alerts.showErrorMessage(message);
    }
    return Observable.throw(error);
  }

  public static getHeaders(): RequestOptionsArgs {
    const headers = {
      'Content-Type': 'application/json',
    };
    return ({
      headers: new Headers(headers)
    });
  }
}
