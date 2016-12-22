import {Component, OnInit} from '@angular/core';
import {SearchParamWrapper} from './search-param-wrapper';
import {SearchParam} from './search-param';

@Component({
    selector: 'data-plane-search',
    templateUrl: 'assets/app/shared/data-plane-search/data-plane-search.component.html',
    styleUrls: ['assets/app/shared/data-plane-search/data-plane-search.component.css']
})

export class DataPlaneSearchComponent implements  OnInit {
    expanded = false;
    allSearchParamWrappers: SearchParamWrapper[] = [];
    appliedSearchParams: SearchParam[] = [];
    newSearchOperators: string[] = [];

    ngOnInit() {
        this.allSearchParamWrappers.push(new SearchParamWrapper(new SearchParam('Size', '',''), ['==', '<', '>', '!=']));
        this.allSearchParamWrappers.push(new SearchParamWrapper(new SearchParam('Tags', '',''), ['==', '<', '>', '!=']));
        this.allSearchParamWrappers.push(new SearchParamWrapper(new SearchParam('Location', '',''), ['==', '!=']));
        this.appliedSearchParams.push(new SearchParam('Size', '>', '10GB'));
        this.appliedSearchParams.push(new SearchParam('Tags', '>', '10GB'));
        this.appliedSearchParams.push(new SearchParam('Location', '==', 'Bangalore'));
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

    onAdd() {
        this.appliedSearchParams.push(new SearchParam('', '', ''));
    }

    createChips() {
        this.expanded = false;
    }
}