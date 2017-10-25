/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

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

