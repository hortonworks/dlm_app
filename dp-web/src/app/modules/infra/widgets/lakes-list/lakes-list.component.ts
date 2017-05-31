import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

import * as moment from 'moment';
import {Sort} from '../../../../shared/utils/enums';
import {Cluster} from '../../../../models/cluster';
import {ClusterService} from '../../../../services/cluster.service';

@Component({
  selector: 'dp-lakes-list',
  templateUrl: './lakes-list.component.html',
  styleUrls: ['./lakes-list.component.scss'],
})

export class LakesListComponent implements OnChanges {
  hoveredIndex;
  lakesList: LakeInfo[] = [];
  lakesListCopy: LakeInfo[] = [];
  @Input() lakes = [];
  @Input() healths = new Map();

  constructor(private clusterService: ClusterService) {
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
    lakeInfo.name = lake.data.name;
    lakeInfo.ambariUrl = lake.data.ambariUrl;
    lakeInfo.lakeId = lake.data.lakeId;
    lakeInfo.cluster = lake.clusters && lake.clusters.length ? lake.clusters[0] : null;
    lakeInfo.services = lake.data.services ? lake.data.services : 'NA';
    if (health) {
      this.populateHealthInfo(lakeInfo, health);
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
    lakeInfo.status = this.getStatus(health);
    lakeInfo.uptimeStr = health.status ? this.doGetUptime(health.status.since) : 'NA';
    lakeInfo.uptime = health.status ? health.status.since : 'NA';
  }

  doGetUptime(since: number) {
    if (!since || since === 0) {
      return 'NA';
    }
    return moment.duration(since).humanize();
  }

  private getStatus(health) {
    if (health && health.status && health.status.state === 'STARTED') {
      return LakeStatus.UP;
    } else if (health && health.status && health.status.state === 'NOT STARTED') {
      return LakeStatus.DOWN;
    } else {
      return LakeStatus.NA;
    }
  }

  getStatusString(status: LakeStatus) {
    if (status === LakeStatus.UP) {
      return LakeStatus[LakeStatus.UP].toLowerCase();
    } else if (status === LakeStatus.DOWN) {
      return LakeStatus[LakeStatus.DOWN].toLowerCase();
    } else {
      return LakeStatus[LakeStatus.NA].toLowerCase();
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
    this.clusterService.retrieveHealth(lakeInfo.cluster.id).subscribe(health => {
      this.populateHealthInfo(lakeInfo, health);
    });
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
            return val1 < val2;
          }
        }

        if ($event.type === 'string') {
          return val2.localeCompare(val1);
        }
        if ($event.type === 'number') {
          return val2 < val1;
        }
      } catch (e) {
      }
    });
  }
}

export enum LakeStatus {
  UP,
  DOWN,
  NA
}

export class LakeInfo {
  name: string;
  lakeId: number;
  ambariUrl: string;
  cluster?: Cluster;
  status?: LakeStatus;
  city?: string;
  country?: string;
  nodes?: number;
  services?: number;
  hdfsUsed?: string;
  hdfsTotal?: string;
  uptime?: string;
  uptimeStr?: string;
}
