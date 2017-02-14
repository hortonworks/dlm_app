import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DataFilter} from '../../models/data-filter';
import {SearchParam} from '../data-plane-search/search-param';

@Component({
    selector: 'chips-bar',
    templateUrl: './chips-bar.component.html',
    styleUrls: ['./chips-bar.component.scss']
})

export class ChipsBarComponent implements OnChanges {
    @Input() searchParams: SearchParam[];
    appliedSearchParams: string[] = [];

    ngOnChanges(changes: SimpleChanges) {
        if (changes['searchParams'] && changes['searchParams'].currentValue) {
            this.searchParams = changes['searchParams'].currentValue;
           this.createSearchParams();
        }
    }

    createSearchParams() {
        if (!this.searchParams || this.searchParams.length  === 0) {
            return;
        }
        for(let searchParam of this.searchParams) {
            this.appliedSearchParams.push(searchParam.key + ' ' + searchParam.operator + ' ' + searchParam.value);
        }
    }

    onRemove(param: string) {
        let index = -1;
        for (let i = 0; i < this.appliedSearchParams.length; i++) {
            if (this.appliedSearchParams[i] === param) {
                index = i;
            }
        }

        if (index !== -1) {
            this.appliedSearchParams.splice(index, 1);
        }
    }
}