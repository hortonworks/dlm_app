import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { Event } from 'models/event.model';
import { TableComponent } from 'common/table/table.component';

@Component({
  selector: 'dlm-notifications-table',
  templateUrl: './notifications-table.component.html',
  styleUrls: ['./notifications-table.component.scss']
})
export class NotificationsTableComponent implements OnInit {
  columns: any[];
  @ViewChild('agoTemplate') agoTemplate: TemplateRef<any>;
  @ViewChild('notificationsTable') notificationsTable: TableComponent;
  @Input() events: Event[];

  ngOnInit() {
    this.columns = [
      {prop: 'eventStatus', name: 'Status', cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'message', name: 'Notification', cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'instanceId', name: 'Host Name', cellClass: 'text-cell', headerClass: 'text-header'},
      {
        prop: 'timestamp',
        cellTemplate: this.agoTemplate,
        name: 'Created',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      }
    ];
  }
}
