import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {SearchParamWrapper} from './search-param-wrapper';
import {SearchParam} from './search-param';
import {DataFilter} from '../../models/data-filter';
import {Environment} from '../../environment';
@Component({
    selector: 'data-plane-search',
    templateUrl: 'data-plane-search.component.html',
    styleUrls: ['data-plane-search.component.scss']
})
export class DataPlaneSearchComponent implements  OnInit {
    allSearchParamWrappers: SearchParamWrapper[] = [];
    appliedSearchParams: SearchParam[] = [];
    newSearchOperators: string[] = [];
    @Input() dataSource: string;
    @Input() searchParamWrappers: SearchParamWrapper[];
    @Input() clearAfterSearch = false;
    @Output() searchFilters = new EventEmitter<{'dataFilter': DataFilter[], 'searchParam': SearchParam[]}>();
    constructor(private environment: Environment) {}
    ngOnInit() {
        this.allSearchParamWrappers = this.searchParamWrappers;
        this.appliedSearchParams.push(new SearchParam('', '', ''));
    }
    onNewSearchKeySeled(key: string) {
        for (let searchParamWrapper of this.allSearchParamWrappers) {
            if (searchParamWrapper.searchParam.key === key) {
                this.newSearchOperators = searchParamWrapper.allowedOperators;
            }
        }
    }
    getUnusedSearchKeys(key: string): string[] {
        let availableSearchParamWrapper = this.allSearchParamWrappers.filter(wrapper => {
            let retValue = true;
            for (let appliedSearchParam of this.appliedSearchParams) {
                if (wrapper.searchParam.key === appliedSearchParam.key) {
                    retValue = false;
                    break;
                }
            }
            return retValue;
        });
        let availbaleSeacrhKeys = availableSearchParamWrapper.map(wrapper => wrapper.searchParam.key);
        availbaleSeacrhKeys.unshift(key);
        return availbaleSeacrhKeys;
    }
    getOperators(key: string): string[] {
        let searchParamWrapper = this.allSearchParamWrappers.filter(wrapper => wrapper.searchParam.key === key);
        return searchParamWrapper.length > 0 ? searchParamWrapper[0].allowedOperators : [];
    }
    onRemove(param: SearchParam) {
        let index = -1;
        for (let i = 0; i < this.appliedSearchParams.length; i++) {
            if (this.appliedSearchParams[i].key === param.key) {
                index = i;
            }
        }
        if (index !== -1) {
            this.appliedSearchParams.splice(index, 1);
        }
        if (this.appliedSearchParams.length === 0) {
            this.onAdd();
        }
    }
    private camelize(str: string) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
            return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
    }
    clear() {
        this.appliedSearchParams = [new SearchParam('', '', '')];
    }
    onAdd() {
        this.appliedSearchParams.push(new SearchParam('', '', ''));
    }
    search() {
        let dataFilters: DataFilter[] = [];
        let dataFilter = new DataFilter();
        dataFilter.predicate = '';
        for (let appliedSearchParam of this.appliedSearchParams) {
            let hivePredicate = this.getPredicatesForDataSource(appliedSearchParam);
            let predicate = hivePredicate.predicate;
            if (typeof predicate === 'string' || predicate instanceof String) {
              predicate = predicate.replace('${operator}', appliedSearchParam.operator);
              predicate = predicate.replace('${value}', appliedSearchParam.value);
            } else if(typeof predicate === 'function') {
              predicate = predicate(appliedSearchParam.value, appliedSearchParam.operator);
            }
            dataFilter.predicate += (dataFilter.predicate && dataFilter.predicate.length > 0 ) ? ' || ' : '';
            dataFilter.predicate += predicate;
            dataFilter.qualifier = hivePredicate.qualifier;
            if (dataFilters.length === 0) {
                dataFilters.push(dataFilter);
            }
        }
        this.searchFilters.emit({'dataFilter': dataFilters, 'searchParam': this.appliedSearchParams});
        if (this.clearAfterSearch) {
            this.clear();
        }
    }
    private getPredicatesForDataSource(appliedSearchParam): {predicate: string, qualifier: string} {
        if (this.dataSource === 'hive') {
            return this.environment.hivePredicates[this.camelize(appliedSearchParam.key)];
        }
        if (this.dataSource === 'hbase') {
            return this.environment.hbasePredicates[this.camelize(appliedSearchParam.key)];
        }
        if (this.dataSource === 'hdfs') {
            return  this.environment.hdfsPredicates[this.camelize(appliedSearchParam.key)];
        }
        return {predicate: '', qualifier: ''};
    }

    getButtonLabel(): string {
        return this.clearAfterSearch ? 'Search' : 'Add Filter';
    }
}
