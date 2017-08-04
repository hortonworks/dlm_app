/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
