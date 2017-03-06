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
      return dataFilterWrappers
        .filter(cDataFilterWrapper => cDataFilterWrapper.dataFilter !== null)
        .map(cDataFilterWrapper => cDataFilterWrapper.dataFilter);
    }
}
