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
