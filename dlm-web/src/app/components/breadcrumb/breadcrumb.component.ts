/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd, PRIMARY_OUTLET} from '@angular/router';
import {capitalize} from '../../utils/string-utils';
import {Breadcrumb} from './breadcrumb.type';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

const ROUTE_DATA_BREADCRUMB = 'breadcrumb';

@Component({
  selector: 'breadcrumb',
  styleUrls: ['./breadcrumb.component.scss'],
  template: `
    <ol class="breadcrumb">
      <li><a routerLink="" class="breadcrumb">{{"topnav.disaster_recovery" | translate}}</a></li>
      <li *ngFor="let breadcrumb of breadcrumbs; let isLast = last" [class.active]="isLast">
        <a *ngIf="!isLast" [routerLink]="[breadcrumb.url, breadcrumb.params]">{{breadcrumb.label}}</a>
        <span *ngIf="isLast">{{breadcrumb.label}}</span>
      </li>
    </ol>
  `
})
export class BreadcrumbComponent implements OnInit, OnDestroy {

  public breadcrumbs: Breadcrumb[];

  public navigationSubscription: Subscription;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private t: TranslateService) {
    this.breadcrumbs = [];
  }

  ngOnInit() {
    this.navigationSubscription = this.router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
      const root: ActivatedRoute = this.activatedRoute.root;
      this.breadcrumbs = this.getBreadcrumbs(root);
    });
  }

  ngOnDestroy() {
    this.navigationSubscription.unsubscribe();
  }

  private getBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }
    for (const child of children) {
      if (child.outlet !== PRIMARY_OUTLET) {
        continue;
      }
      const {data, params, url: sUrl} = child.snapshot;
      const routeURL: string = sUrl.map(segment => segment.path).join('/');
      if (data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        // data.breadcrumb exists
        if (data[ROUTE_DATA_BREADCRUMB]) {
          // data.breadcrumb is not null
          url += `/${routeURL}`;
          const breadcrumb: Breadcrumb = {
            label: this.t.instant(data[ROUTE_DATA_BREADCRUMB]),
            params,
            url
          };
          breadcrumbs.push(breadcrumb);
        }
      } else {
        // data.breadcrumb doesn't exists
        url += `/${routeURL}`;
        if (sUrl.length) {
          const breadcrumb: Breadcrumb = {
            label: capitalize(sUrl[sUrl.length - 1].path),
            params,
            url
          };
          breadcrumbs.push(breadcrumb);
        }
      }
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }

}
