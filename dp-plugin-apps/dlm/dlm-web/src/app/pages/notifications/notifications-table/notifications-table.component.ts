import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { Event } from 'models/event.model';
import { Cluster } from 'models/cluster.model';
import { TableComponent } from 'common/table/table.component';
import { TranslateService } from '@ngx-translate/core';
import { LogService } from 'services/log.service';
import { LOG_EVENT_TYPE_MAP, EntityType } from 'constants/log.constant';

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

  constructor(private t: TranslateService, private logService: LogService) {}

  private translateColumn(columnName: string): string {
    return this.t.instant(`page.notifications.table.column.${columnName}`);
  }

  getEntity(event: Event) {
    const eventType = (event && 'eventType' in event) ? event['eventType'] : '';
    if (eventType === 'policyinstance' || eventType === 'policy') {
      if (event['instanceId']) {
        return this.getPolicyName(event.instanceId);
      } else if (event['policyId']) {
        return this.getPolicyName(event.policyId);
      }
    }
    return eventType;
  }

  getPolicyName(id: string): string {
    // Extract policy name from the policy id in the format
    // "policyId": "/beaconsource/beaconsource/beacontarget/beacontarget/hdfsdr/0/1494924228843/000000002"
    const splits = id.split('/');
    return splits.length >= 6 ? splits[5] : '';
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
        cellTemplate: this.logTemplate
      },
      {
        prop: 'timestamp',
        cellTemplate: this.agoTemplate,
        name: this.translateColumn('created'),
        cellClass: 'text-cell',
        headerClass: 'text-header',
        maxWidth: 200
      }
    ];
  }

  showLog(event: Event) {
    const eventType = event.eventType;
    if (eventType in EntityType) {
      this.logService.showLog(EntityType[eventType], event[this.logEventTypeMap[EntityType[eventType]]]);
    }
  }
}
