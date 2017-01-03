import {DataFilter} from './data-filter';
import {SearchParam} from '../shared/data-plane-search/search-param';
export class DataFilterWrapper {
    searchParams: SearchParam[];
    progress = false;

    constructor(public dataFilter: DataFilter, public data: any [] = []) {
    }

    public static createDataFilters(dataFilter: DataFilter): DataFilterWrapper {
        return new DataFilterWrapper(<DataFilter>JSON.parse(JSON.stringify(dataFilter)), []);
    }

    public static getDataFilters(dataFilterWrappers: DataFilterWrapper[]): DataFilter[] {
        let filters: DataFilter[] = [];
        dataFilterWrappers.forEach(wrapper => {
            if (wrapper.dataFilter[0] != null)
                filters.push(wrapper.dataFilter[0]);
        });
        return filters.length === 0 ? [] : filters;
    }
}