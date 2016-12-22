import {SearchParam} from './search-param';
export class SearchParamWrapper {
    constructor(public searchParam: SearchParam, public allowedOperators: string[]) {

    }
}