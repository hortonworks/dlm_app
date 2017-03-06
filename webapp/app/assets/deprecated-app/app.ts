import {Component,AfterViewInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/authservice';
import {Environment} from './environment';
import {Persona} from './shared/utils/persona';

declare var Datamap:any;
declare var componentHandler:any;

@Component({
    selector: 'data-plane',
    styleUrls: ['assets/app/app.css'],
    templateUrl: 'assets/app/app.html'
})

export default class AppComponent implements AfterViewInit  {

    persona = Persona;
    who: number = 1;

    constructor(public router: Router,private authService: AuthService, private environment: Environment) {
        this.who = Math.floor(Math.random() * 2) + 1;
    }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    getUserName(): string {
        return localStorage.getItem('user');
    }


    ngAfterViewInit() {
        componentHandler.upgradeAllRegistered();
    }
}
