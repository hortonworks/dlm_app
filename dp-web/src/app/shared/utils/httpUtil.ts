import {Response, RequestOptionsArgs} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import {Headers} from '@angular/http';
import {Alerts} from './alerts';
import { User } from '../../models/user';
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
     // window.location.replace(window.location.origin + '/sign-in#SESSEXPIRED');
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

    try {
      const user = <User> JSON.parse(localStorage.getItem('dp_user'));

      if(user.token) {
        Object.assign(headers, {
          'Authorization': `Bearer ${user.token}`
        });
      }
    } catch (error) {
      // TODO: do something reasonable
    }

    return ({
      headers: new Headers(headers)
    });
  }
}
