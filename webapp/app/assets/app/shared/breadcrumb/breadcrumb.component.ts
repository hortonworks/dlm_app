/**
 * Created by rksv on 29/11/16.
 */
import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'bread-crumb',
    styleUrls: ['assets/app/shared/breadcrumb/breadcrumb.component.css'],
    templateUrl: 'assets/app/shared/breadcrumb/breadcrumb.component.html'

})
export class BreadcrumbComponent {
    @Input() crumbMap:{} = {};

    constructor(private router: Router) {}

    getCrumbNames(): string[] {
        return Object.keys(this.crumbMap);
    }

    navigate($event:any, crumbName: string) {
        this.router.navigate([this.crumbMap[crumbName]]);
        $event.preventDefault();
    }
}