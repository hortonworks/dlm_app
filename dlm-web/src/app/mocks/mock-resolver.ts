import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Request, RequestMethod } from '@angular/http';
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
