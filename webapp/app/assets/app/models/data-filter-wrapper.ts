import {DataFilter} from './data-filter';
export class DataFilterWrapper {

    constructor(public dataFilter: DataFilter, public data:any [] = []) {}

    public static createDataFilters(dataFilter: DataFilter): DataFilterWrapper {
        return new DataFilterWrapper(<DataFilter>JSON.parse(JSON.stringify(dataFilter)), []);
    }

    public static getDataFilters(dataFilterWrappers: DataFilterWrapper[]): DataFilter[] {
        let filters = dataFilterWrappers.map(wrapper => wrapper.dataFilter[0]);
        return filters.length === 0 ? [] : filters;
    }
}