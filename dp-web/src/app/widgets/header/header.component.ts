import {Component, Input} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import {User} from '../../models/user';

@Component({
  selector: 'dp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() user:User;

  constructor(private router: Router) { }

  logout() {
    this.router.navigate(['/sign-out']);
  }
}