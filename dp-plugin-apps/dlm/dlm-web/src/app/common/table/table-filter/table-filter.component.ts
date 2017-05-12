import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { AppliedFilterMapped, TableFilterItem } from './table-filter-item.type';
import { TypeaheadOption } from './typeahead-option.type';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { toKeyValueArray } from '../../../utils/object-utils';
import { capitalize } from '../../../utils/string-utils';

@Component({
  selector: 'dlm-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss']
})
export class TableFilterComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * Data shown in the table
   */
  @Input() data: any[];

  /**
   * List of possible filters. Each item should contain info about:
   *  * `propertyName` - property name to be filtered
   *  * `multiple` - is filter multiple
   */
  @Input() filterBy: TableFilterItem[];

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
      appliedFilters[filter.propertyName] = filter.multiple ? [] : '';
    });
    this.appliedFilters.next(appliedFilters);
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
        const val = record[filter.propertyName];
        if (filter.values.indexOf(val) === -1) {
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

}