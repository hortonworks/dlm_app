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

import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild, HostListener, ElementRef
} from '@angular/core';
import { AppliedFilterMapped, TableFilterItem } from './table-filter-item.type';
import { TypeaheadOption } from './typeahead-option.type';
import { BehaviorSubject, Subscription } from 'rxjs';
import { capitalize } from 'utils/string-utils';
import { toKeyValueArray, multiLevelResolve } from 'utils/object-utils';
import { TypeaheadDirective } from 'ngx-bootstrap';

@Component({
  selector: 'dlm-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss']
})
export class TableFilterComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * @type {string}
   */
  @Input() initialInputValue = '';

  /**
   * @type {boolean}
   */
  @Input() restoreState = false;

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
   * Determines if `applyInitialFilters` should be called on `initialFilters` updates
   * @type {boolean}
   */
  @Input() ignoreInitialFiltersUpdate = false;

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
   * Fires when user types something in the input-field
   * @type {EventEmitter}
   */
  @Output() onInput: EventEmitter<any> = new EventEmitter();

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

  /**
   * True when no matching results are found
   */
  typeaheadNoResults = false;

  @ViewChild('no_results_container') noResultsContainer: ElementRef;

  @ViewChild(TypeaheadDirective) typeaheadInput: TypeaheadDirective;
  @ViewChild('typeaheadInput') typeaheadInputDom: ElementRef;

  @HostListener('document:click', ['$event'])
  outsideClickHandler(e) {
    if (this.typeaheadNoResults === true && !this.noResultsContainer.nativeElement.contains(e.target)) {
      this.typeaheadNoResults = false;
    }
  }

  constructor() {
    this.appliedFiltersSubscription = this.appliedFilters.subscribe(appliedFilters => {
      this.appliedFiltersMapped = toKeyValueArray(appliedFilters).filter(i => i.value);
    });
  }

  ngOnInit() {
    this.applyInitialFilters();
    if (this.restoreState && this.initialInputValue) {
      this.filter = this.initialInputValue;
      $(this.typeaheadInputDom.nativeElement).focus();
      this.typeaheadInput.onChange({target: {value: this.initialInputValue}});
    }
  }

  applyInitialFilters() {
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

  ngOnChanges(changes) {
    this.typeaheadOptions = this.prepareTypeaheadOptions();
    if (changes['initialFilters'] && !this.ignoreInitialFiltersUpdate) {
      this.applyInitialFilters();
    }
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
      appliedFilters[propertyName] = [value];
    }
    this.appliedFilters.next(appliedFilters);
    this.onFilter.emit(appliedFilters);
    // left input empty
    this.filter = '';
    this.onInput.emit('');
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

  handleTypeaheadNoResults(e: boolean): void {
    this.typeaheadNoResults = e;
  }

  onKey(): void {
    this.onInput.emit(this.filter);
  }
}
