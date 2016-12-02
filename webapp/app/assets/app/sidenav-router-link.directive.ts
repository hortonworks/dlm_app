/**
 * Created by rksv on 26/11/16.
 */
import { Directive, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
    selector: '[sidenavRouterLink]'
})

export class SidenavRouterLinkDirective {

    constructor(private router: Router) {
    }

    @Input() sidenavRouterLink: Array<string>;

    @HostListener('click', ['$event'])
    onClick($event: any) {
        let layout: any;
        layout = document.querySelector('.mdl-layout');
        layout.MaterialLayout.toggleDrawer();
        this.router.navigate(this.sidenavRouterLink);
        $event.preventDefault();
    }
}