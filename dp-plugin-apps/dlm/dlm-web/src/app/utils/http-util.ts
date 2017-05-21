import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

export const toJson = (response: Response) => response.json();
export const mapResponse = (response$: Observable<Response>) => response$.map(toJson);
