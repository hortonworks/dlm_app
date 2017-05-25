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
      <li><a routerLink="" class="breadcrumb"><i class="fa fa-gg"></i></a></li>
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
