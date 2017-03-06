import {Component, AfterViewInit, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {DataCenterService} from '../../services/data-center.service';
import {DataCenter} from '../../models/data-center';
import {DataCenterDetails} from '../../models/data-center-details';
import {Host} from '../../models/host';
import {MathUtils} from '../../shared/utils/mathUtils';
import {NameNodeInfo} from '../../models/name-node-info';

declare var Datamap:any;

@Component({
    selector: 'view-cluster' ,
    styleUrls: ['./view-cluster.component.scss'],
    templateUrl: './view-cluster.component.html'
})

export class ViewClusterComponent implements OnInit {

    breadCrumbMap: any = {};
    dataCenterName: string = '';
    dataCenter: DataCenter = new DataCenter();
    dataCenterDetails = new DataCenterDetails();

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private dataCenterService: DataCenterService) {}

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.dataCenterName = params['id'];
            this.breadCrumbMap = {'Datacenter':'dashboard'};
            this.breadCrumbMap[this.dataCenterName] = '';
            this.getDataCenterData();
        });
    }

    getDataCenterData() {
        this.dataCenterService.getDetails(this.dataCenterName).subscribe((dataCenterDetail)=> {
            this.dataCenterDetails = dataCenterDetail;
        });
    }

    getStorage(ambariHost: string): string {
        let diskUsed = 0, diskAvailable = 0;
        for (let host of this.dataCenterDetails.hosts) {
            if (ambariHost === host.ambariHost) {
                for (let diskStat of host.diskStats) {
                    diskUsed += parseInt(diskStat.used);
                    diskAvailable += parseInt(diskStat.available);
                }
            }
        }

        return MathUtils.bytesToSize(diskUsed) + '/' + MathUtils.bytesToSize(diskAvailable);
    }

    getNodes(ambariHost: string): number {
        let count = 0;
        for (let host of this.dataCenterDetails.hosts) {
            if (ambariHost === host.ambariHost) {
                ++count;
            }
        }

        return count;
    }

    getUpTime(nameNodeInfo: NameNodeInfo): string {
        return MathUtils.dateToHumanReadableForm(new Date().getTime() - nameNodeInfo.startTime);
    }

    onHostSelect(host: Host) {
        let navigationExtras = {
            'queryParams' : {'host': host.ambariHost}
        };
        this.router.navigate(['view-data/' + this.dataCenterName], navigationExtras);
    }

    createCluster() {
        this.router.navigate(['cluster/add']);
    }
}