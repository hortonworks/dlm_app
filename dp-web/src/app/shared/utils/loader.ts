import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export enum LoaderStatus{
  HIDDEN,
  SHOWN
}

export class Loader {

  static loaderObserver = new BehaviorSubject(LoaderStatus.HIDDEN);

  public static show(): void {
    Loader.loaderObserver.next(LoaderStatus.SHOWN)
  }

  public static hide(): void {
    Loader.loaderObserver.next(LoaderStatus.HIDDEN)
  }

  public static getStatus(): Observable<LoaderStatus> {
    return Loader.loaderObserver;
  }
}

