/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface Filters {
  timeRange: string;
  [id: string]: any;
}

@Injectable()
export class OverviewJobsExternalFiltersService {

  filters$: BehaviorSubject<Filters> = new BehaviorSubject(<Filters>{});

  constructor() {
  }

  setFilter(key, value) {
    const currentFilters = this.filters$.getValue();
    currentFilters[key] = value;
    this.filters$.next(currentFilters);
  }

}
