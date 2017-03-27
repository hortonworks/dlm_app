import {Response, RequestOptionsArgs} from '@angular/http';
import {Observable}     from 'rxjs/Observable';
import {Headers} from '@angular/http';
import {Alerts} from './alerts';
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
      localStorage.removeItem('dp_auth_token');
      window.location.replace(window.location.origin + '/sign-in#SESSEXPIRED');
      return Observable.throw(error);
    }

    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    if (error._body) {
      Alerts.showErrorMessage(JSON.parse(error._body).message);
    }
    return Observable.throw(error);
  }

  public static getHeaders(): RequestOptionsArgs {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('dp_auth_token');
    if(token) {
      Object.assign(headers, {
        'Authorization': `Bearer ${token}`
      });
    }
    return ({
      headers: new Headers(headers)
    });
  }
}
