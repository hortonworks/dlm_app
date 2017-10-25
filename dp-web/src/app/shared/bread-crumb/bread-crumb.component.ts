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

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Params, PRIMARY_OUTLET } from '@angular/router';

@Component({
  selector: 'dp-bread-crumb',
  templateUrl: './bread-crumb.component.html',
  styleUrls: ['./bread-crumb.component.scss']
})
export class BreadCrumbComponent implements OnInit, OnDestroy {

  breadcrumbs: IBreadcrumb[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.breadcrumbs = [];
  }

  ngOnInit(): void {
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe(event => {
        const root: ActivatedRoute = this.activatedRoute.root;
        this.breadcrumbs = this.getBreadcrumbs(root);
      });
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }

  private getBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: IBreadcrumb[] = []
  ): IBreadcrumb[] {
    const ROUTE_DATA_BREADCRUMB: string = 'crumb';

    //get the child routes
    let children: ActivatedRoute[] = route.children;

    //run only for child in primary route
    const cChild = children.find(cChild => cChild.outlet === PRIMARY_OUTLET);

    //return if there are no more children in primary route
    if (!cChild) {
      return breadcrumbs;
    }

    const {data, params, url: cUrl} = cChild.snapshot;
    //verify the custom data property "breadcrumb" is specified on the route
    if (!data.hasOwnProperty(ROUTE_DATA_BREADCRUMB) || !data[ROUTE_DATA_BREADCRUMB]) {
      return this.getBreadcrumbs(cChild, url, breadcrumbs);
    }

    //get the route's URL segment
    let routeURL: string = cUrl.map(segment => segment.path).join("/");

    //append route URL to URL
    url += `/${routeURL}`;

    //add breadcrumb
    breadcrumbs.push({
      label: data[ROUTE_DATA_BREADCRUMB],
      params,
      url
    } as IBreadcrumb);

    //recursive
    return this.getBreadcrumbs(cChild, url, breadcrumbs);
  }
}

interface IBreadcrumb {
  label: string;
  params: Params;
  url: string;
}
