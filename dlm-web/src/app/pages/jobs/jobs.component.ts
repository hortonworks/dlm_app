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

import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {getAllJobs} from '../../selectors/job.selector';
import * as fromRoot from '../../reducers';
import {Job} from '../../models/job.model';
import {Observable} from 'rxjs/Observable';
import {loadJobs} from '../../actions/job.action';
import {DropdownItem} from '../../components/dropdown/dropdown-item';
import {ActivatedRoute, Router} from '@angular/router';
import { TableFilterItem } from '../../common/table/table-filter/table-filter-item.type';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { filterCollection } from '../../utils/array-util';

@Component({
  selector: 'dp-main',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {

  filterByStatus$: BehaviorSubject<any> = new BehaviorSubject('');
  filters$: BehaviorSubject<any> = new BehaviorSubject({});
  jobs$: Observable<Job[]>;
  filteredJobs$: Observable<Job[]>;

  addOptions: DropdownItem[] = [
    {label: 'Cluster', path: '../clusters/create'},
    {label: 'Policy', path: '../policies/create'},
    {label: 'Pairing', path: '../pairings/create'}
  ];

  filterBy: TableFilterItem[] = [
    {multiple: true, propertyName: 'service'},
    {multiple: false, propertyName: 'policy'},
    {multiple: true, propertyName: 'source'},
    {multiple: true, propertyName: 'target'},
    {multiple: false, propertyName: 'path'}
  ];

  constructor(private store: Store<fromRoot.State>,
              private router: Router,
              private route: ActivatedRoute) {
    this.jobs$ = store.select(getAllJobs);

    this.filteredJobs$ = Observable.combineLatest(this.jobs$, this.filterByStatus$, this.filters$)
      .map(([jobs, filterByStatus, filters]) => {
        return this.filterJobs(jobs, {...filters, status: filterByStatus});
      });
  }

  ngOnInit() {
    this.store.dispatch(loadJobs());
  }

  filterJobs(jobs, filters) {
    return filterCollection(jobs, filters);
  }

  handleAddSelected(option: DropdownItem) {
    this.router.navigate([option.path], {relativeTo: this.route});
  }

  onFilter(filters) {
    this.filters$.next(filters);
  }

  filterJobsByStatus(status) {
    this.filterByStatus$.next(status);
  }

}
