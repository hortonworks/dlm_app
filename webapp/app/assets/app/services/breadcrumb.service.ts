import {Injectable} from '@angular/core';

@Injectable()
export class BreadcrumbService {
    crumbMap:{[key: string]: string}[] = [];

    constructor() {
        this.crumbMap = [];
    }
}