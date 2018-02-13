import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../../services/authentication.service';
import {AuthUtils} from '../utils/auth-utils';
import {User} from '../../models/user';

@Component({
  selector: 'dss-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user = new User('', '', '', '', [], false, false, '');

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.user = AuthUtils.getUser();
  }

  logout() {
    this.authenticationService
    .signOutAndRedirect();
  }

}
