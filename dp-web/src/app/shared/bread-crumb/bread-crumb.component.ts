import {Component, Input} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'dp-bread-crumb',
  templateUrl: './bread-crumb.component.html',
  styleUrls: ['./bread-crumb.component.scss']
})
export class BreadCrumbComponent {

  personaName = '';
  crumbNames: string[] = [];
  crumbNamesToURLMap: any = {};

  constructor(private router: Router) {
    router.events.subscribe(event => {
      let path = window.location.pathname;
      if (event instanceof NavigationEnd && path === event.urlAfterRedirects) {
        this.setCrumbNames(event.urlAfterRedirects);
      }
    });
  }

  createCrumbs(crumbs: string[], url: string) {
    console.log(url, crumbs);
    this.crumbNamesToURLMap = {};

    if (url.startsWith('datasteward')) {
      this.createDataStewardCrumbs(url);
    } else if (url.startsWith('infra')) {
      this.createInfraCrumbs(url);
    } else if (url.startsWith('analytics')) {
      this.createAnalyticsCrumbs(url);
    }

    this.crumbNames = Object.keys(this.crumbNamesToURLMap);
  }

  createAnalyticsCrumbs(url: string) {

    if (url.match(/^analytics\/workspace$/)) {
      this.crumbNamesToURLMap['Workspace'] = 'analytics/workspace';
    } else if (url.match(/analytics\/workspace\/(.*)\/assets/)) {
      let matchArray = url.match(/analytics\/workspace\/(.*)\/assets/);
      let workSpaceName = matchArray[1];
      this.crumbNamesToURLMap['DataSet' + ' - ' + workSpaceName] = 'analytics/workspace';
      this.crumbNamesToURLMap['Assets'] = '';
    }
  }

  createDataStewardCrumbs(url: string) {
    this.crumbNamesToURLMap['DataSet'] = 'datasteward/dataset/';

    if (url.startsWith('datasteward/dataset/full-view')) {
      this.crumbNamesToURLMap['Details'] = '';
    } else if (url.startsWith('datasteward/dataset/edit')) {
      this.crumbNamesToURLMap['Edit'] = '';
    } else if (url.startsWith('datasteward/dataset/add')) {
      this.crumbNamesToURLMap['Add'] = '';
    } else if (url.startsWith('datasteward/dataset/assets/details')) {
      this.crumbNamesToURLMap['Asset Details'] = '';
    }
  }


  createInfraCrumbs(url: string) {
    if (url.startsWith('infra/clusters')) {
      this.crumbNamesToURLMap['Clusters'] = '';
    } else if (url.startsWith('infra/add')) {
      this.crumbNamesToURLMap['Clusters'] = 'infra/clusters';
      this.crumbNamesToURLMap['Add'] = '';
    } else if (url.startsWith('infra/cluster/details')) {
      this.crumbNamesToURLMap['Clusters'] = 'infra/clusters';
      this.crumbNamesToURLMap['Details'] = '';
    } else if (url.startsWith('infra/usermgmt/users')) {
      this.crumbNamesToURLMap['Users'] = '';
    } else if (url.startsWith('infra/usermgmt/groups')) {
      this.crumbNamesToURLMap['Groups'] = '';
    } else if (url.startsWith('infra/services')) {
      this.crumbNamesToURLMap['Services'] = '';
    }
  }

  setCrumbNames(url: string) {
    url = BreadCrumbComponent.normalizeURL(url);

    this.crumbNames = [];
    let crumbs = url.split('/');
    this.personaName = crumbs.shift();
    this.createCrumbs(crumbs, url);
  }

  private static normalizeURL(url:string) {
    url = url.replace(/\/\(.*\)$/, ''); //Remove all the aux outlet routes
    url = url.replace(/^\//, ''); // Remove leading slash '/'
    url = url.replace(/\/$/, ''); // Remove trailing slash '/'
    return url;
  }

  navigateToPersonaHome() {
    let url = BreadCrumbComponent.normalizeURL(window.location.pathname);
    url  = url.split('/')[0];
    if (url && url.length > 0) {
      this.router.navigate([url]);
    }
  }

  navigateToBreadCrumb(crumbName: string) {
    let url = this.crumbNamesToURLMap[crumbName];
    if (url && url.length > 0) {
      this.router.navigate([url]);
    }
  }

}
