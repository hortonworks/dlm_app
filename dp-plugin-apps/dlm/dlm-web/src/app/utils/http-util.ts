/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Response, RequestOptionsArgs, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'models/user.model';

export const toJson = (response: Response) => response.json();
export const mapResponse = (response$: Observable<Response>) => response$.map(toJson);

export const getHeaders = (): RequestOptionsArgs => {
  const headers = {
    'Content-Type': 'application/json',
  };
  return ({
    headers: new Headers(headers)
  });
};
