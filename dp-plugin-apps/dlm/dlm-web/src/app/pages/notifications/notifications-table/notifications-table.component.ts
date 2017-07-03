import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { Event } from 'models/event.model';
import { Cluster } from 'models/cluster.model';
import { TableComponent } from 'common/table/table.component';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { Log } from 'models/log.model';
import { getAllLogs } from 'selectors/log.selector';
import { loadLogs } from 'actions/log.action';
import { LogModalDialogComponent } from 'components/log-modal-dialog/log-modal-dialog.component';


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
  @ViewChild('logModalDialog') logModalDialog: LogModalDialogComponent;
  selectedEvent$: BehaviorSubject<Event> = new BehaviorSubject(<Event>{});
  logMessage$: Observable<string>;
  @Input() events: Event[];
  @Input() clusters: Cluster[];

  constructor(private t: TranslateService, private store: Store<State>) {
    this.logMessage$ = this.selectedEvent$.switchMap(selectedEvent => {
      return this.store.select(getAllLogs).map(logs => {
        const filteredLogs: Log[] = logs.filter(log => log.instanceId === selectedEvent.instanceId);
        return filteredLogs.length ? filteredLogs[0].message : '';
      });
    });
  }

  private translateColumn(columnName: string): string {
    return this.t.instant(`page.notifications.table.column.${columnName}`);
  }

  getEntity(event: Event) {
    const eventType = (event && 'eventType' in event) ? event['eventType'] : '';
    if (eventType === 'policyinstance') {
      if (event['instanceId']) {
        const splits = event.instanceId.split('/');
        if (splits.length >= 4) {
          return splits[3];
        }
      }
    }
    return eventType;
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
    if (eventType === 'policyinstance') {
      if (event['instanceId']) {
        const splits = event.instanceId.split('/');
        if (splits.length >= 3 && splits[1] && splits[2]) {
          const dataCenter = splits[1];
          const clusterName = splits[2];
          const filteredClusters = this.clusters.filter(cluster => cluster.dataCenter === dataCenter && cluster.name === clusterName);
          if (filteredClusters.length) {
            const clusterId = filteredClusters[0].id;
            this.store.dispatch(loadLogs(clusterId, event.instanceId));
            this.selectedEvent$.next(event);
            this.logModalDialog.show();
          }
        }
      }
    }
  }
}
