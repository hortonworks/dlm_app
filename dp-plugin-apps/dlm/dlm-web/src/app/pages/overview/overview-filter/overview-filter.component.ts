/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit } from '@angular/core';
import { OVERVIEW_FILTERS } from 'constants/date.constant';
import { OverviewJobsExternalFiltersService } from '../../../services/overview-jobs-external-filters.service';

@Component({
  selector: 'dlm-overview-filter',
  templateUrl: './overview-filter.component.html',
  styleUrls: ['./overview-filter.component.scss']
})
export class OverviewFilterComponent implements OnInit {
  activeOption = '';
  OVERVIEW_FILTERS = OVERVIEW_FILTERS;

  constructor(private overviewJobsExternalFiltersService: OverviewJobsExternalFiltersService) {
  }

  ngOnInit() {
    this.doFilter(OVERVIEW_FILTERS.DAYS);
  }

  doFilter(option) {
    if (this.activeOption !== option) {
      this.activeOption = option;
      this.overviewJobsExternalFiltersService.setFilter('timeRange', this.activeOption);
    }
  }
}
