/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
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
  filterOptions: any[] = [];
  filters = [];
  searchText: string;
  showFilterListing = false;
  selectedFilterIndex = -1;
  private availableFilterCount = 0;
  @Input() lakes = [];
  @Input() healths = new Map();
  @Output('onRefresh') refreshEmitter: EventEmitter<number> = new EventEmitter<number>();

  static optionListClass = 'option-value';
  static highlightClass = 'highlighted-filter';

  filterFields = [
    {key: 'name', display: 'Name'},
    {key: 'city', display: 'City'},
    {key: 'country', display: 'Country'},
    {key: 'dataCenter', display: 'Data Center'}];

  constructor(private clusterService: ClusterService, private router: Router) {
  }

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick($event: MouseEvent, targetElement: HTMLElement): void {
    if (targetElement.id === 'search') {
      return;
    }
    this.showFilterListing = false;
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
      if (this.filters && this.filters.length) {
        this.filter(true);
      }
    }
  }

  private extractLakeInfo(lake, health, location) {
    let lakeInfo: LakeInfo = new LakeInfo();
    lakeInfo.id = lake.data.id;
    lakeInfo.name = lake.data.name;
    lakeInfo.ambariUrl = lake.data.ambariUrl;
    lakeInfo.lakeId = lake.data.id;
    lakeInfo.dataCenter = lake.data.dcName;
    lakeInfo.cluster = lake.clusters && lake.clusters.length ? lake.clusters[0] : null;
    lakeInfo.services = lake.data.services ? lake.data.services : 'NA';
    lakeInfo.isWaiting = lake.data.isWaiting;
    if (health) {
      this.populateHealthInfo(lakeInfo, health);
    } else {
      lakeInfo.status = lakeInfo.isWaiting ? LakeStatus.WAITING : LakeStatus.NA;
    }
    if (location) {
      lakeInfo.city = location.city;
      lakeInfo.country = location.country;
    }
    return lakeInfo;
  }

  private populateHealthInfo(lakeInfo, health) {
    lakeInfo.hdfsUsed = (health.usedSize && !this.isSyncError(health)) ? health.usedSize : 'NA';
    lakeInfo.hdfsTotal = (health.totalSize && !this.isSyncError(health)) ? health.totalSize : 'NA';
    lakeInfo.nodes = (health.nodes && !this.isSyncError(health)) ? health.nodes : 'NA';
    lakeInfo.status = this.getStatus(health, lakeInfo);
    lakeInfo.startTime = (health.status && !this.isSyncError(health)) ? health.status.startTime : null;
    lakeInfo.uptimeStr = (health.status && !this.isSyncError(health)) ? DateUtils.toReadableDate(health.status.since) : 'NA';
    lakeInfo.uptime = (health.status && !this.isSyncError(health)) ? health.status.since : 'NA';
  }

  isSyncError(health) {
    return health.status.state === 'SYNC_ERROR';
  }

  viewDetails(lakeId) {
    this.router.navigate([`infra/cluster/details`, lakeId]);
  }

  private getStatus(health, lakeInfo) {
    if (health && health.status && health.status.state === 'STARTED') {
      return LakeStatus.UP;
    } else if (health && health.status && (health.status.state === 'NOT STARTED' || health.status.state === 'SYNC_ERROR')) {
      return LakeStatus.DOWN;
    } else if (lakeInfo.isWaiting) {
      return LakeStatus.WAITING;
    } else {
      return LakeStatus.NA;
    }
  }

  filter(isAddition) {
    if (!this.filters || this.filters.length === 0) {
      this.lakesList = this.lakesListCopy.slice();
      this.showFilterListing = false;
      return;
    }
    if (isAddition) {
      this.filterOnAddition();
    } else {
      this.filterOnRemoval();
    }
    this.selectedFilterIndex = -1;
  }

  private filterOnAddition() {
    this.filters.forEach(filter => {
      this.lakesList = this.lakesList.filter(lakeInfo => {
        return lakeInfo[filter.key] === filter.value;
      });
    });
  }

  private filterOnRemoval() {
    this.filters.forEach(filter => {
      this.lakesList = this.lakesListCopy.filter(lakeInfo => {
        return lakeInfo[filter.key] === filter.value;
      });
    });
  }

  removeFilter(filter) {
    for (let i = 0; i < this.filters.length; i++) {
      let filterItem = this.filters[i];
      if (filterItem.key === filter.key && filterItem.value === filter.value) {
        this.filters.splice(i, 1);
        break;
      }
    }
    this.filter(false);
  }

  addToFilter(display, key, value) {
    if (!this.filters.find(filter => filter.key === key && filter.value === value)) {
      this.filters.push({'key': key, 'value': value, 'display': display});
    }
    this.filter(true);
    this.searchText = '';
    this.showFilterListing = false;
  }

  handleKeyboardEvents(event, display?, key?, value?) {
    let keyPressed = event.keyCode || event.which;
    if (keyPressed === 40 && this.selectedFilterIndex < this.availableFilterCount - 1) {
      ++this.selectedFilterIndex;
      this.highlightSelected();
      return;
    } else if (keyPressed === 38 && this.selectedFilterIndex !== 0) {
      --this.selectedFilterIndex;
      this.highlightSelected();
      return;
    } else if (keyPressed === 13 && this.selectedFilterIndex !== -1) {
      this.addToFilter(display, key, value);
      return;
    }
  }

  private highlightSelected() {
    let filterOptions = document.getElementsByClassName(LakesListComponent.optionListClass);
    let highlighted = document.getElementsByClassName(LakesListComponent.highlightClass);
    for (let i = 0; i < highlighted.length; i++) {
      let elt = highlighted.item(i);
      elt.className = 'option-value';
    }
    let highlightedOption: any = filterOptions[this.selectedFilterIndex];
    highlightedOption.focus();
    highlightedOption.className += ` ${LakesListComponent.highlightClass}`;
  }

  showOptions(event) {
    let keyPressed = event.keyCode || event.which;
    if (keyPressed === 38 || keyPressed === 40) {
      this.handleKeyboardEvents(event);
    } else {
      this.filterOptions = [];
      let filterOptionsMap = new Map();
      let term = event.target.value.trim().toLowerCase();
      if (term.length === 0) {
        this.selectedFilterIndex = -1;
        this.showFilterListing = false;
        return;
      }
      this.availableFilterCount = 0;
      this.lakesList.forEach(lakeInfo => {
        this.filterFields.forEach(field => {
          if (lakeInfo[field.key] && lakeInfo[field.key].toLowerCase().indexOf(term) >= 0) {
            this.availableFilterCount++;
            let values = filterOptionsMap.get(field.key);
            if (values && values.indexOf(lakeInfo[field.key]) === -1) {
              values.push(lakeInfo[field.key]);
            } else if (!values) {
              values = [lakeInfo[field.key]];
            }
            filterOptionsMap.set(field.key, values);
          }
        });
      });
      this.populateFilterOptions(filterOptionsMap);
      this.showFilterListing = true;
    }
  }


  private populateFilterOptions(filterOptionsMap: Map<string, Array<any>>) {
    this.filterFields.forEach(filterField => {
      let values = filterOptionsMap.get(filterField.key);
      if (values && values.length > 0) {
        this.filterOptions.push({'displayName': filterField.display, 'key': filterField.key, values: values});
      }
    });
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
