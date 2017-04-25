import { Component, ViewEncapsulation } from '@angular/core';
import { MenuItem } from './common/navbar/menu-item';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { TranslateService } from '@ngx-translate/core';
import { initApp } from 'actions/app.action';

@Component({
  selector: 'dlm',
  templateUrl: './dlm.component.html',
  styleUrls: ['./dlm.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class DlmComponent {
  header: MenuItem;
  menuItems: MenuItem[];
  mainContentSelector = '#dlm_content';
  fitHeight = true;
  constructor(t: TranslateService, private store: Store<State>) {
    t.setTranslation('en', require('../assets/i18n/en.json'));
    t.setDefaultLang('en');
    t.use('en');
    this.header = new MenuItem(
        t.instant('sidenav.menuItem.header'),
        './overview',
        '<i class="fa fa-gg" aria-hidden="true"></i>'
    );
    this.menuItems = [
      new MenuItem(
          t.instant('sidenav.menuItem.overview'),
          './overview',
          '<span class="navigation-icon glyphicon glyphicon-home"></span>'
      ),
      new MenuItem(
          t.instant('sidenav.menuItem.clusters'),
          './clusters',
          '<span class="navigation-icon glyphicon glyphicon-globe"></span>'
      ),
      new MenuItem(
          t.instant('sidenav.menuItem.pairings'),
          './pairings',
          '<span class="navigation-icon glyphicon glyphicon-resize-horizontal"></span>'
      ),
      new MenuItem(
          t.instant('sidenav.menuItem.policies'),
          './policies',
          '<span class="navigation-icon glyphicon glyphicon-list-alt"></span>'
      ),
      new MenuItem(
          t.instant('sidenav.menuItem.jobs'),
          './jobs',
          '<span class="navigation-icon glyphicon glyphicon-hourglass"></span>'
      ),
      new MenuItem(
          t.instant('sidenav.menuItem.help'),
          './help',
          '<span class="navigation-icon glyphicon glyphicon-info-sign"></span>'
      )
    ];
    this.store.dispatch(initApp());
  }
}
