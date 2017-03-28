import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, Params } from '@angular/router';

import { BreadcrumbService } from '../../services/breadcrumb.service';
import { Environment } from '../../environment';

@Component({
  selector: 'dp-breadcrumb',
  styleUrls: ['./breadcrumb.component.scss'],
  templateUrl: './breadcrumb.component.html',
})
export class BreadcrumbComponent implements OnInit {

  @Input()
  crumbMap:{[key: string]: string} = {};

  crumbs:{[key: string]: string}[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private environment: Environment
  ) {}

  ngOnInit() {
    // http://stackoverflow.com/a/38808735/640012
    // http://stackoverflow.com/a/38310404/640012
    // http://brianflove.com/2016/10/23/angular2-breadcrumb-using-router/
    this.router.events
      .filter(cEvent => cEvent instanceof NavigationEnd)
      .subscribe(cEvent => {
        // this.handleUrl(cEvent.url);
        this.crumbs = [];
        const url = '';
        // do {
        //   let childrenRoutes = currentRoute.children;
        //   currentRoute = null;
        //   childrenRoutes.forEach(route => {
        //     if(route.outlet === 'primary') {
        //       let routeSnapshot = route.snapshot;
        //       console.log('snapshot:', routeSnapshot)
        //       url += '/' + routeSnapshot.url.map(segment => segment.path).join('/');
        //       this.crumbs.push({
        //         label: route.snapshot.data.breadcrumb,
        //         url: url
        //       });
        //       currentRoute = route;
        //     }
        //   })
        // } while(currentRoute);
      });
  }

  handleUrl(url: string) {
    let found = false;
    for (let index = 0; index < this.breadcrumbService.crumbMap.length; index++) {
        if (decodeURIComponent(decodeURIComponent(this.breadcrumbService.crumbMap[index]['url'])) === decodeURIComponent(decodeURIComponent(url))) {
            this.breadcrumbService.crumbMap.splice(index+1);
            found = true;
            break;
        }
    }

    if (!found) {
        this.addToBreadCrumb(url, this.activatedRoute.snapshot.queryParams);
    }

    this.crumbs = this.breadcrumbService.crumbMap;
  }

  private addToBreadCrumb(url:string, queryParams: Params) {
    if (url.indexOf('/dashboard') === 0) {
        this.breadcrumbService.crumbMap.push({'url': url, 'name': 'Dashboard'});
    } else if (url.indexOf('/view-data') === 0) {
        this.breadcrumbService.crumbMap.push({'url': url, 'name': 'Host: ' + queryParams['host']});
    } else if (url.indexOf('/data-lake') === 0) {
        this.breadcrumbService.crumbMap.push({'url': url, 'name': 'Lake' + ': ' + url.split('/')[3].split('?')[0]});
    } else if (url.indexOf('/data-analyst/dataset/add') === 0) {
        this.breadcrumbService.crumbMap.push({'url': url, 'name': 'Add Data Set'});
    } else if (url.indexOf('/data-analyst/dataset/view/') === 0) {
        this.breadcrumbService.crumbMap.push({'url': url, 'name': 'Data Set: ' + url.split('/')[5].split('?')[0]});
    } else if (url.indexOf('/cluster/add') === 0) {
        this.breadcrumbService.crumbMap.push({'url': url, 'name': 'Add Cluster'});
    }

  }

  decode(crumbName): string {
    return decodeURIComponent(decodeURIComponent(crumbName));
  }

  navigate($event: any, crumb: any, index: number) {
    this.breadcrumbService.crumbMap.splice(index + 1);
    this.router.navigate([crumb.url]);
    $event.preventDefault();
  }
}
