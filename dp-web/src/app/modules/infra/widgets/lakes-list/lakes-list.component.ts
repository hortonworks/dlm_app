import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';

import {Sort} from '../../../../shared/utils/enums';
import {Cluster} from '../../../../models/cluster';
import {ClusterService} from '../../../../services/cluster.service';
import {DateUtils} from '../../../../shared/utils/date-utils';

@Component({
  selector: 'dp-lakes-list',
  templateUrl: './lakes-list.component.html',
  styleUrls: ['./lakes-list.component.scss'],
})

export class LakesListComponent implements OnChanges {
  lakesList: LakeInfo[] = [];
  lakesListCopy: LakeInfo[] = [];
  statusEnum = LakeStatus;
  @Input() lakes = [];
  @Input() healths = new Map();
  @Output('onRefresh') refreshEmitter: EventEmitter<number> = new EventEmitter<number>();

  constructor(private clusterService: ClusterService, private router: Router) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.lakes) {
      return;
    }
    if (changes['lakes'] || changes['healths']) {
      let lakesList: LakeInfo[] = [];
      this.lakes.forEach((lake) => {
        let lakeHealthInfo = this.healths.get(lake.data.id);
        if (lakeHealthInfo) {
          lakesList.push(this.extractLakeInfo(lake, lakeHealthInfo.health, lakeHealthInfo.location));
        } else {
          lakesList.push(this.extractLakeInfo(lake, null, null));
        }
      });
      this.lakesList = lakesList;
      this.lakesListCopy = lakesList;
    }
  }

  private extractLakeInfo(lake, health, location) {
    let lakeInfo: LakeInfo = new LakeInfo();
    lakeInfo.id = lake.data.id;
    lakeInfo.name = lake.data.name;
    lakeInfo.ambariUrl = lake.data.ambariUrl;
    lakeInfo.lakeId = lake.data.id;
    lakeInfo.dataCenter= lake.data.dcName;
    lakeInfo.cluster = lake.clusters && lake.clusters.length ? lake.clusters[0] : null;
    lakeInfo.services = lake.data.services ? lake.data.services : 'NA';
    lakeInfo.isWaiting = lake.data.isWaiting;
    if (health) {
      this.populateHealthInfo(lakeInfo, health);
    }else{
      lakeInfo.status = lakeInfo.isWaiting ? LakeStatus.WAITING : LakeStatus.NA;
    }
    if (location) {
      lakeInfo.city = location.city;
      lakeInfo.country = location.country;
    }
    return lakeInfo;
  }

  private populateHealthInfo(lakeInfo, health) {
    lakeInfo.hdfsUsed = health.usedSize ? health.usedSize : 'NA';
    lakeInfo.hdfsTotal = health.totalSize ? health.totalSize : 'NA';
    lakeInfo.nodes = health.nodes ? health.nodes : 'NA';
    lakeInfo.status = this.getStatus(health,lakeInfo);
    lakeInfo.startTime = health.status ? health.status.startTime : null;
    lakeInfo.uptimeStr = health.status ? DateUtils.toReadableDate(health.status.since) : 'NA';
    lakeInfo.uptime = health.status ? health.status.since : 'NA';
  }

  viewDetails(lakeId) {
    this.router.navigate([`infra/cluster/details`, lakeId]);
  }

  private getStatus(health,lakeInfo) {
    if (health && health.status && health.status.state === 'STARTED') {
      return LakeStatus.UP;
    } else if (health && health.status && health.status.state === 'NOT STARTED') {
      return LakeStatus.DOWN;
    } else if(lakeInfo.isWaiting){
      return LakeStatus.WAITING;
    } else {
      return LakeStatus.NA;
    }
  }

  filter(event) {
    let term = event.target.value.trim();
    let filtered = this.lakesListCopy.filter((lakeInfo) => {
      return lakeInfo.name.indexOf(term) >= 0;
    });
    this.lakesList = filtered;
  }

  refresh(lakeInfo) {
    this.refreshEmitter.emit(lakeInfo.lakeId);
  }

  onSort($event) {
    this.lakesList.sort((obj1: any, obj2: any) => {
      try {
        let val1 = $event.sortBy.split('.').reduce((obj1, k) => {
          return obj1[k];
        }, obj1);
        let val2 = $event.sortBy.split('.').reduce((obj2, k) => {
          return obj2[k];
        }, obj2);

        if ($event.sortOrder === Sort.ASC) {
          if ($event.type === 'string') {
            return val1.localeCompare(val2);
          }
          if ($event.type === 'number') {
            return val1 > val2;
          }
          if ($event.type === 'duration') {
            return DateUtils.compare(val1, val2);
          }
        }
        if ($event.type === 'string') {
          return val2.localeCompare(val1);
        }
        if ($event.type === 'number') {
          return val1 < val2;
        }
        if ($event.type === 'duration') {
          return DateUtils.compare(val2, val1);
        }
      } catch (e) {
      }
    });
  }
}

export enum LakeStatus {
  UP,
  DOWN,
  WAITING,
  NA
}

export class LakeInfo {
  id: number;
  name: string;
  lakeId: number;
  ambariUrl: string;
  cluster?: Cluster;
  status?: LakeStatus;
  dataCenter: string;
  city?: string;
  country?: string;
  nodes?: number;
  services?: number;
  hdfsUsed?: string = 'NA';
  hdfsTotal?: string = 'NA';
  uptime?: string = 'NA';
  uptimeStr?: string = 'NA';
  startTime?: number;
  isWaiting: boolean;


  get hdfsUsedInBytes(): number {
    return this.toBytes(this.hdfsUsed);
  }

  private toBytes(byteWithSize) {
    if (byteWithSize === 'NA') {
      return 0;
    } else {
      let values = byteWithSize.trim().split(' ');
      let size = values[1];
      let k = 1024;
      let sizes = Array('Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');
      let i = sizes.indexOf(size);
      return parseInt(values[0], 10) * Math.pow(k, i);
    }
  }
}
