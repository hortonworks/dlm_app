import {Component, Input} from '@angular/core';
import { Router } from '@angular/router';

import {User} from '../../models/user';
import {AuthUtils} from '../../shared/utils/auth-utils';

@Component({
  selector: 'dp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() user:User;
  signoutURL = AuthUtils.signoutURL;

  constructor(private router: Router) {
  }

  logout() {
    this.router.navigate([this.signoutURL]);
  }
}
