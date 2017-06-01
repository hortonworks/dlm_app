import { Component } from '@angular/core';
import { OVERVIEW_FILTERS } from 'constants/date.constant';
import { OverviewJobsExternalFiltersService } from '../../../services/overview-jobs-external-filters.service';

@Component({
  selector: 'dlm-overview-filter',
  templateUrl: './overview-filter.component.html',
  styleUrls: ['./overview-filter.component.scss']
})
export class OverviewFilterComponent {
  activeOption = '';
  OVERVIEW_FILTERS = OVERVIEW_FILTERS;

  constructor(private overviewJobsExternalFiltersService: OverviewJobsExternalFiltersService) {
  }

  doFilter(option) {
    this.activeOption = this.activeOption === option ? '' : option;
    this.overviewJobsExternalFiltersService.setFilter('timeRange', this.activeOption);
  }
}
