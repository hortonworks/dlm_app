/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Request } from '@angular/http';
import { routes } from './mock-routes';

export class MockResolver {
  constructor() {}

  resolveRequest(request: Request): Request {
    return routes.filter((route) => {
      return route.match(request);
    }).map((matched) => {
      return matched.toRequest(request);
    })[0];
  }
}
