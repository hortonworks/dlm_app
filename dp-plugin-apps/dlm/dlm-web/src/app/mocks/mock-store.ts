import {of} from 'rxjs/observable/of';
import {Store} from '@ngrx/store';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';

class ObserverMock implements Observer<any> {
  closed? = false;
  nextVal: any = '';

  constructor() {
  }

  next = (value: any): void => {
    this.nextVal = value;
  }

  error = (err: any): void => {
    console.error(err);
  }

  complete = (): void => {
    this.closed = true;
  }
}

const actionReducer$: ObserverMock = new ObserverMock();
const action$: ObserverMock = new ObserverMock();
const obs$: Observable<any> = new Observable<any>();

export class MockStore extends Store<any> {
  constructor() {
    super(action$, actionReducer$, obs$);
  }

  select = () => of([]);
}
