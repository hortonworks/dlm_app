import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MenuItem } from './common/navbar/menu-item';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { TranslateService } from '@ngx-translate/core';
import { Event } from 'models/event.model';
import { Observable } from 'rxjs/Observable';
import { getDisplayedEvents, getNewEventsCount } from 'selectors/event.selector';
import { initApp } from 'actions/app.action';
import { loadEvents, loadNewEventsCount } from 'actions/event.action';
import { NAVIGATION } from 'constants/navigation.constant';
import { User } from './models/user.model';
import { SessionStorageService } from './services/session-storage.service';
import { TimeZoneService } from './services/time-zone.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'dlm',
  templateUrl: './dlm.component.html',
  styleUrls: ['./dlm.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class DlmComponent implements OnDestroy {
  header: MenuItem;
  menuItems: MenuItem[];
  mainContentSelector = '#dlm_content';
  fitHeight = true;
  events$: Observable<Event[]>;
  newEventsCount$: Observable<number>;
  navigationColumns = NAVIGATION;
  onOverviewPage = false;
  routeSubscription: Subscription;

  // mock current user
  user: User = <User>{fullName: 'Jim Raynor', timezone: ''};

  constructor(t: TranslateService,
              private store: Store<State>,
              private sessionStorageService: SessionStorageService,
              private timeZoneService: TimeZoneService,
              private router: Router,
              private route: ActivatedRoute) {
    t.setTranslation('en', require('../assets/i18n/en.json'));
    t.setDefaultLang('en');
    t.use('en');
    // Provide selected by user timezone to the TimezoneService instance
    // It allows to convert dates using this timezone
    // @see Pipe `fmt-tz`
    const tz = this.sessionStorageService.get('tz');
    this.timeZoneService.userTimezoneIndex$.next(tz);
    this.user.timezone = tz;

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
        t.instant('sidenav.menuItem.help'),
        './help',
        '<span class="navigation-icon glyphicon glyphicon-info-sign"></span>'
      )
    ];
    this.events$ = store.select(getDisplayedEvents);
    this.newEventsCount$ = store.select(getNewEventsCount);
    this.store.dispatch(initApp());
    this.store.dispatch(loadNewEventsCount());
    this.store.dispatch(loadEvents());
    this.routeSubscription = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.onOverviewPage = this.checkTopPath(route, 'overview');
      }
    });
  }

  private checkTopPath(route, path) {
    const {children} = route;
    if (!children.length) {
      return false;
    }
    const {url} = children[0];
    if (!url) {
      return false;
    }
    const urlValue = url.getValue();
    if (!urlValue.length) {
      return false;
    }
    return urlValue[0].path === path;
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  saveUserTimezone(timezoneIndex) {
    // todo save not only in the local storage
    this.sessionStorageService.set('tz', timezoneIndex);
    this.timeZoneService.userTimezoneIndex$.next(timezoneIndex);
  }

  logout() {
    // do logout
  }

}
