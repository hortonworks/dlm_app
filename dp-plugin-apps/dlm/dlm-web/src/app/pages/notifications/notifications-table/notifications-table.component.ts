import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { Event } from 'models/event.model';
import { TableComponent } from 'common/table/table.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dlm-notifications-table',
  templateUrl: './notifications-table.component.html',
  styleUrls: ['./notifications-table.component.scss']
})
export class NotificationsTableComponent implements OnInit {
  columns: any[];
  @ViewChild('agoTemplate') agoTemplate: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate: TemplateRef<any>;
  @ViewChild('notificationsTable') notificationsTable: TableComponent;
  @Input() events: Event[];

  constructor(private t: TranslateService) { }

  private translateColumn(columnName: string): string {
    return this.t.instant(`page.notifications.table.column.${columnName}`);
  }

  ngOnInit() {
    this.columns = [
      {
        prop: 'eventStatus',
        name: this.translateColumn('status'),
        cellClass: 'text-cell',
        headerClass: 'text-header',
        maxWidth: 100,
        cellTemplate: this.statusTemplate
      },
      {prop: 'message', name: this.translateColumn('message'), cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'instanceId', name: this.translateColumn('instance_id'), cellClass: 'text-cell', headerClass: 'text-header'},
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
}
