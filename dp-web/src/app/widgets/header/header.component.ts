import {Component, Input} from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import {User} from '../../models/user';
import {CollapsibleNavService} from '../../services/collapsible-nav.service';

@Component({
  selector: 'dp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  crumbNames: string[] = [];
  @Input() user:User;

  constructor(private router: Router,
              private collapsibleNavService: CollapsibleNavService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart ) {
        this.setCrumbNames(event.url);
      }
    });
  }

  logout() {
    this.router.navigate(['/sign-out']);
  }

  setCrumbNames(url: string) {
    this.crumbNames = url.replace(/^\//, '').split('/');
  }
}