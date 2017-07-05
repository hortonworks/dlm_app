import {Component, Input} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import {User} from '../../models/user';
import {CollapsibleNavService} from '../../services/collapsible-nav.service';

@Component({
  selector: 'dp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  personaName = '';
  crumbNames: string[] = [];
  @Input() user:User;

  constructor(private router: Router,
              private collapsibleNavService: CollapsibleNavService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setCrumbNames(event.urlAfterRedirects);
      }
    });
  }

  logout() {
    this.router.navigate(['/sign-out']);
  }

  setCrumbNames(url: string) {
    url = url.replace(/\/\(.*\)$/, ''); //Remove all the aux outlet routes
    url = url.replace(/^\//, ''); // Remove leading slash '/'

    this.crumbNames = [];
    let crumbs = url.split('/');
    this.personaName = crumbs.shift();
    let crumbName = '';
    crumbs.forEach(name => {
      let isValueCrumb =  crumbName.length !== 0;
      crumbName += isValueCrumb ? ' - ' : '';
      crumbName += name;
      if (isValueCrumb) {
        this.crumbNames.push(crumbName);
        crumbName = '';
      }
    });

    if (crumbName.length > 0) {
      this.crumbNames.push(crumbName);
    }
  }
}