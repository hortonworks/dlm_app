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
