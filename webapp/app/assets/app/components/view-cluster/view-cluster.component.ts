import {Component, AfterViewInit, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {DataCenterService} from '../../services/data-center.service';
import {DataCenter} from '../../models/data-center';

declare var Datamap:any;

@Component({
    selector: 'view-cluster' ,
    styleUrls: ['assets/app/components/view-cluster/view-cluster.component.css'],
    templateUrl: 'assets/app/components/view-cluster/view-cluster.component.html'
})

export default class ViewClusterComponent implements AfterViewInit, OnInit {

    breadCrumbMap: any = {};
    dataCenterName: string = '';
    dataCenter: DataCenter = new DataCenter();

    constructor(private activatedRoute: ActivatedRoute, private router: Router,private dataCenterService: DataCenterService) {}

    ngAfterViewInit() {
        console.log('here');
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.dataCenterName = params['id'];
            this.breadCrumbMap = {'Datacenter':'ui/dashboard'};
            this.breadCrumbMap[this.dataCenterName] = '';
            this.getDataCenterData();
        });
    }

    getDataCenterData() {
        this.dataCenterService.getByName(this.dataCenterName).subscribe(dataCenter => {
            this.dataCenter = dataCenter;
        });
    }

    showDataView(name: string) {
        this.router.navigate(['ui/view-data/'+name]);
    }
}