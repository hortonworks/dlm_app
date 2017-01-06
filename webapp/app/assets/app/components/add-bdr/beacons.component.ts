import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import Rx from 'rxjs/Rx';
import {DataCenter} from '../../models/data-center';
import {CityNames} from '../../common/utils/city-names';
import {DataCenterDetails} from '../../models/data-center-details';
import {Ambari} from '../../models/ambari';
import {BackupPolicy} from '../../models/backup-policy';
import {Location} from '../../models/location';
import {DataCenterService} from '../../services/data-center.service';
import {AmbariService} from '../../services/ambari.service';
import {BackupPolicyService} from '../../services/backup-policy.service';

import {Environment} from '../../environment';

import {DataFilter} from '../../models/data-filter';
import {DataFilterWrapper} from '../../models/data-filter-wrapper';
import {SearchQueryService} from '../../services/search-query.service';
import {SearchParam} from '../../shared/data-plane-search/search-param';
import {DataSet} from '../../models/data-set';
import {SearchQuery} from '../../models/search-query';
import {SearchParamWrapper} from '../../shared/data-plane-search/search-param-wrapper';

declare var Datamap:any;
declare var d3:any;
declare var moment: any;

@Component({
    selector: 'add-bdr',
    templateUrl: 'assets/app/components/add-bdr/beacons.component.html',
    styleUrls: ['assets/app/components/add-bdr/beacons.component.css', 'assets/app/components/add-bdr/beacons.overrides.css']
})
export class BeaconsComponent implements OnInit, AfterViewInit {

  viewMode: string = 'create';
  runMode: string = 'hourly';
  isAdvanceEnabled: boolean = false;

  label: string = '';
  source: {
    dataCenter?: DataCenter,
    cluster?: Ambari,
    resourceId?: string,
    resourceType?: string
  } = {
    resourceId: '',
    resourceType: 'hive'
  };
  target: {
    dataCenter?: DataCenter,
    cluster?: Ambari
  } = {};
  schedule: {
    scheduleType?: string,
    frequency?: string,
  } = {
    scheduleType: '',
    frequency: '',
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dcService: DataCenterService,
    private ambariService: AmbariService,
    private policyService: BackupPolicyService,
    private environment: Environment,
    private searchQueryService: SearchQueryService
  ) {
    //
  }

  ngOnInit() {
    //
  }

  ngAfterViewInit() {
    //
  }

  doSelectViewMode(viewMode: string) {
    this.viewMode = viewMode;
  }

  doSetScheduleMode(runMode: string) {
    this.runMode = runMode;
  }

  doToggleAdvanced() {
    this.isAdvanceEnabled = !this.isAdvanceEnabled;
  }

  doSave() {
    const policy = new BackupPolicy();
    policy.label = this.label;
    policy.source = {
      dataCenterId: this.source.dataCenter.name,
      clusterId: this.source.cluster.host,
      resourceId: this.source.resourceId,
      resourceType: this.source.resourceType
    };
    policy.target = {
      dataCenterId: this.target.dataCenter.name,
      clusterId: this.target.cluster.host
    };
    policy.schedule = this.schedule;

    this.policyService.create(policy)
      .subscribe(
        () => this.router.navigate(['/ui/dashboard'])
      );
  }
}
