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
import {Subject} from 'rxjs/Subject';
import {PersonaTabs} from '../models/header-data';

@Injectable()
export class CollapsibleNavService {

  private _tabs: PersonaTabs[] = [];
  private _activeTab: PersonaTabs;

  /* This event is to reload the side nav*/
  navChanged = new Subject<boolean>();
  navChanged$ = this.navChanged.asObservable();

  /* This event is to expand collpase side nav some cmp like DataSet needs them to be collapsed*/
  collpaseSideNav = new Subject<boolean>();
  collpaseSideNav$ = this.collpaseSideNav.asObservable();

  get tabs():PersonaTabs[] {
    return this._tabs;
  }

  setTabs(tabs: PersonaTabs[], activeTab: PersonaTabs) {
    this._tabs = tabs;
    this._activeTab = activeTab ? activeTab : tabs[0];
    this.navChanged.next();
  }

  get activeTab():PersonaTabs {
    return this._activeTab;
  }
}
