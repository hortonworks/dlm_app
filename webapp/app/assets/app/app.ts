import {Component,AfterViewInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/authservice';
import {Environment} from './environment';
import {Persona} from './shared/utils/persona';
import {BreadcrumbService} from './services/breadcrumb.service';

declare var Datamap:any;
declare var componentHandler:any;

@Component({
    selector: 'data-plane',
    styleUrls: ['assets/app/app.css'],
    templateUrl: 'assets/app/app.html'
})

export default class AppComponent implements AfterViewInit  {

    persona = Persona;

    constructor(public router: Router,private authService: AuthService, private environment: Environment,
                private breadcrumbService: BreadcrumbService) {
        this.breadcrumbService.crumbMap = [];
    }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }


    ngAfterViewInit() {
        componentHandler.upgradeAllRegistered();
    }
}
