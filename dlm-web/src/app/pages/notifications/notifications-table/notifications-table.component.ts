/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Event } from 'models/event.model';
import { Cluster } from 'models/cluster.model';
import { TableComponent } from 'common/table/table.component';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from 'services/log.service';
import { LOG_EVENT_TYPE_MAP, EntityType } from 'constants/log.constant';
import { getEventEntityName } from 'utils/event-utils';
import { timestampComparator } from 'utils/table-util';

@Component({
  selector: 'dlm-notifications-table',
  templateUrl: './notifications-table.component.html',
  styleUrls: ['./notifications-table.component.scss']
})

export class NotificationsTableComponent implements OnInit {
  columns: any[];
  @ViewChild('agoTemplate') agoTemplate: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate: TemplateRef<any>;
  @ViewChild('entityTemplate') entityTemplate: TemplateRef<any>;
  @ViewChild('logTemplate') logTemplate: TemplateRef<any>;
  @ViewChild('notificationsTable') notificationsTable: TableComponent;
  logEventTypeMap = LOG_EVENT_TYPE_MAP;
  @Input() events: Event[];
  @Input() clusters: Cluster[];

  constructor(private t: TranslateService,
              private logService: LogService,
              private router: Router) {}

  private translateColumn(columnName: string): string {
    return this.t.instant(`page.notifications.table.column.${columnName}`);
  }

  getEntity(event: Event): string {
    return getEventEntityName(event);
  }

  ngOnInit() {
    this.columns = [
      {
        prop: 'event',
        name: this.translateColumn('status'),
        cellClass: 'text-cell',
        headerClass: 'text-header',
        maxWidth: 100,
        cellTemplate: this.statusTemplate
      },
      {prop: 'message', name: this.translateColumn('message'), cellClass: 'text-cell', headerClass: 'text-header'},
      {
        prop: 'instanceId',
        name: this.translateColumn('entity'),
        cellClass: 'text-cell',
        headerClass: 'text-header',
        cellTemplate: this.entityTemplate
      },
      {
        name: this.translateColumn('log'),
        cellClass: 'text-cell',
        headerClass: 'text-header',
        cellTemplate: this.logTemplate,
        sortable: false
      },
      {
        prop: 'timestamp',
        cellTemplate: this.agoTemplate,
        name: this.translateColumn('created'),
        cellClass: 'text-cell',
        headerClass: 'text-header',
        comparator: timestampComparator,
        maxWidth: 200
      }
    ];
  }

  showLog(event: Event) {
    const eventType = event.eventType;
    if (eventType in EntityType) {
      this.logService.showLog(EntityType[eventType], event[this.logEventTypeMap[EntityType[eventType]]], event.timestamp);
    }
  }

  goToPolicy(event: Event) {
    this.router.navigate(['/policies'], {queryParams: {policy: this.getEntity(event)}});
  }

}
