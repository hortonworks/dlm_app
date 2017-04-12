import {SearchParam} from './search-param';
import {DataFilter} from '../../models/data-filter';
export class SearchParamWrapper {
    constructor(public searchParam: SearchParam, public allowedOperators: string[]) {}
}