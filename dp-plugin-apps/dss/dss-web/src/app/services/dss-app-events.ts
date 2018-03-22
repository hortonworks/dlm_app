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

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';


@Injectable()
export class DssAppEvents {
  sideNavCollapsed$: Observable<boolean>;
  private sideNavCollapsed: Subject<boolean>;

  dataSetCollaborationPaneCollapsed$: Observable<boolean>;
  private dataSetCollaborationPaneCollapsed: Subject<boolean>;

  assetCollaborationPaneCollapsed$: Observable<boolean>;
  private assetCollaborationPaneCollapsed: Subject<boolean>;

  constructor() {
    this.sideNavCollapsed = new Subject<boolean>();
    this.sideNavCollapsed$ = this.sideNavCollapsed.asObservable();

    this.dataSetCollaborationPaneCollapsed = new Subject<boolean>();
    this.dataSetCollaborationPaneCollapsed$ = this.dataSetCollaborationPaneCollapsed.asObservable();

    this.assetCollaborationPaneCollapsed = new Subject<boolean>();
    this.assetCollaborationPaneCollapsed$ = this.assetCollaborationPaneCollapsed.asObservable();
  }

  setSideNavCollapsed(newValue: boolean) {
    this.sideNavCollapsed.next(newValue);
  }

  setDataSetCollaborationPaneCollapsed(newValue: boolean) {
    this.dataSetCollaborationPaneCollapsed.next(newValue);
  }

  setAssetCollaborationPaneCollapsed(newValue: boolean) {
    this.assetCollaborationPaneCollapsed.next(newValue);
  }
}
