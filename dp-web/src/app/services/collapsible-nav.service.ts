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
