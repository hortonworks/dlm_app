import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { Environment } from './environment';
import { Persona } from './shared/utils/persona';

declare var componentHandler: any;

@Component({
  selector: 'data-plane',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit  {

  persona = Persona;

  constructor(
    public router: Router,
    private authService: AuthenticationService,
    public environment: Environment
  ) {

  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  getUserName(): string {
    return localStorage.getItem('user');
  }

  ngAfterViewInit() {
    componentHandler.upgradeAllRegistered();
  }
}