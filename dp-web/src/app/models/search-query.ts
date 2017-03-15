import {DataFilter} from './data-filter';
export class SearchQuery {
    clusterHost: string;
    dataCenter: string;
    predicates: DataFilter[];
}
