/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { AppliedFilterMapped, TableFilterItem } from './table-filter-item.type';
import { TypeaheadOption } from './typeahead-option.type';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { toKeyValueArray } from 'utils/object-utils';
import { capitalize } from 'utils/string-utils';
import { multiLevelResolve } from 'utils/object-utils';

@Component({
  selector: 'dlm-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss']
})
export class TableFilterComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * Data shown in the table
   */
  @Input() data: any[] = [];

  /**
   * List of possible filters. Each item should contain info about:
   *  * `propertyName` - property name to be filtered
   *  * `multiple` - is filter multiple
   */
  @Input() filterBy: TableFilterItem[];

  /**
   * List of filters to applied by default while initializing
   */
  @Input() initialFilters: {propertyName: string, value: string []} [] = [];

  /**
   * Fires when some filter is applied or removed
   * Send information about all current filters
   * @type {EventEmitter}
   */
  @Output() onFilter: EventEmitter<any> = new EventEmitter();

  /**
   * value bound to the input-element
   */
  filter: any;

  appliedFilters: BehaviorSubject<any> = new BehaviorSubject({});
  appliedFiltersSubscription: Subscription;

  /**
   * Remapped `appliedFilters`-value to show as a list of labels
   * key - property name to apply filter
   * value - filter value
   * @type {Array}
   */
  appliedFiltersMapped: AppliedFilterMapped[] = [];

  /**
   * List of options shown in the typeahead
   * It's mapped from `data` and `filterBy`
   * @type {Array}
   */
  typeaheadOptions: TypeaheadOption[] = [];

  constructor() {
    this.appliedFiltersSubscription = this.appliedFilters.subscribe(appliedFilters => {
      this.appliedFiltersMapped = toKeyValueArray(appliedFilters).filter(i => i.value);
    });
  }

  ngOnInit() {
    const appliedFilters = {};
    this.filterBy.forEach(filter => {
      const filtered = this.initialFilters ? this.initialFilters.filter(
        initialFilter => initialFilter.propertyName === filter.propertyName) : [];
      let value = filter.multiple ? [] : '';
      if (filtered.length > 0) {
        value = filter.multiple ? filtered[0].value : filtered[0].value[0];
      }
      appliedFilters[filter.propertyName] = value;
    });
    this.appliedFilters.next(appliedFilters);
    this.onFilter.emit(appliedFilters);
  }

  ngOnChanges() {
    this.typeaheadOptions = this.prepareTypeaheadOptions();
  }

  ngOnDestroy() {
    this.appliedFiltersSubscription.unsubscribe();
  }

  /**
   * Generate typeahead options for filter input
   * Since typeahead should show all possible filter-values grouped by property name to apply,
   * we have to parse all `data` items and all `filterBy` items to combine them
   * @return {TypeaheadOption[]}
   */
  prepareTypeaheadOptions() {
    let typeaheadOptions = [];
    this.filterBy.forEach(filter => {
      if (!Array.isArray(filter.values)) {
        filter.values = [];
      }
      filter.filterTitle = filter.filterTitle || capitalize(filter.propertyName);
    });
    this.data.map(record => {
      this.filterBy.forEach(filter => {
        const val = multiLevelResolve(record, filter.propertyName);
        if (val && filter.values.indexOf(val) === -1) {
          filter.values.push(val);
        }
      });
    });
    this.filterBy.forEach(filter => {
      const newFilterOptions = filter.values.map(value => ({value, filter}));
      typeaheadOptions = [...typeaheadOptions, ...newFilterOptions];
    });
    return typeaheadOptions;
  }

  /**
   * Apply filter
   * If filter is multiple, just add new value to it
   * If filter is not multiple, set its value
   * @param {{item: {filter: TableFilterItem}, value: any}} $event
   */
  addFilter($event) {
    const propertyName = $event.item.filter.propertyName;
    const value = $event.value;
    const appliedFilters = this.appliedFilters.getValue();
    if ($event.item.filter.multiple) {
      if (appliedFilters[propertyName].indexOf(value) === -1) {
        appliedFilters[propertyName].push(value);
      }
    } else {
      appliedFilters[propertyName] = value;
    }
    this.appliedFilters.next(appliedFilters);
    this.onFilter.emit(appliedFilters);
    // left input empty
    this.filter = '';
  }

  /**
   * Remove filter
   * If filter for `key` is multiple (is array), just remove `value` from this array
   * If filter is not multiple, drop its value to empty string
   * @param {AppliedFilterMapped} mappedFilterItem
   */
  removeFilter(mappedFilterItem) {
    const {key, value} = mappedFilterItem;
    const appliedFilters = this.appliedFilters.getValue();
    if (appliedFilters[key] === value) {
      appliedFilters[key] = '';
    } else {
      appliedFilters[key] = appliedFilters[key].filter(item => item !== value);
    }
    this.appliedFilters.next(appliedFilters);
    this.onFilter.emit(appliedFilters);
  }

  getFilterTitle(key) {
    const filtered = this.filterBy.filter(filter => filter.propertyName === key);
    return filtered.length ? filtered[0].filterTitle : capitalize(key);
  }
}
