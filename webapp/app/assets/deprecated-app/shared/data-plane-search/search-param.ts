import {DataFilter} from '../../models/data-filter';
export class SearchParam  {
    constructor(public key: string, public operator: string, public value: string) { }
}