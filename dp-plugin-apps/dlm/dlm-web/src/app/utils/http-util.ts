import { Response, RequestOptionsArgs, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'models/user.model';

export const toJson = (response: Response) => response.json();
export const mapResponse = (response$: Observable<Response>) => response$.map(toJson);

export const getHeaders = (): RequestOptionsArgs => {
  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    const user = <User> JSON.parse(localStorage.getItem('dp_user'));

    if (user.token) {
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
};
