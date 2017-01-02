import {Component, Input} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {BreadcrumbService} from '../../services/breadcrumb.service';

@Component({
    selector: 'bread-crumb',
    styleUrls: ['assets/app/shared/breadcrumb/breadcrumb.component.css'],
    templateUrl: 'assets/app/shared/breadcrumb/breadcrumb.component.html'

})
export class BreadcrumbComponent {
    // This can be referenced as view child instead of input map ?
    @Input() crumbMap:{[key: string]: string} = {};
    crumbKeys:{[key: string]: string}[] = [];

    constructor(private router: Router, private breadcrumbService: BreadcrumbService) {
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd && event.url !== '') {
                this.handleUrl(event.url);
            }
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
            this.addToBreadCrumb(url);
        }

        this.crumbKeys = this.breadcrumbService.crumbMap;
    }

    private addToBreadCrumb(url:string) {
        if (url.indexOf('/ui/dashboard') === 0) {
            this.breadcrumbService.crumbMap.push({'url': url, 'name': 'Dashboard'});
        } else if (url.indexOf('/ui/view-data') === 0) {
            this.breadcrumbService.crumbMap.push({'url': url, 'name': 'Host: ' + url.split('/')[3].split('?')[0]});
        } else if (url.indexOf('/ui/view-cluster') === 0) {
            this.breadcrumbService.crumbMap.push({'url': url, 'name': 'Data Lake: ' + url.split('/')[3].split('?')[0]});
        } else if (url.indexOf('/ui/data-analyst/dataset/add') === 0) {
            this.breadcrumbService.crumbMap.push({'url': url, 'name': 'Add Data Set'});
        } else if (url.indexOf('/ui/data-analyst/dataset/view/') === 0) {
            this.breadcrumbService.crumbMap.push({'url': url, 'name': 'Data Set: ' + url.split('/')[5].split('?')[0]});
        }
    }

    decode(crumbName): string {
        return decodeURIComponent(decodeURIComponent(crumbName));
    }

    navigate($event: any, crumb: any, index: number) {
        this.breadcrumbService.crumbMap.splice(index+1);
        this.router.navigate([crumb.url]);
        $event.preventDefault();
    }
}