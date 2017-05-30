import { Component, Input } from '@angular/core';
import {DpTableDirective, SortEvent} from '../dp-table.directive';
import {Sort} from '../../utils/enums';

@Component({
  selector: 'dp-config-sorter',
  templateUrl: './dp-sorter.component.html',
  styleUrls: ['./dp-sorter.component.scss']
})
export class DpSorterComponent {

  @Input() sortBy: string;
  @Input() type = 'string';

  sortAsc = false;
  sortDesc = false;

  constructor(private dpTable: DpTableDirective ) {
    this.dpTable.onSortColumnChange.subscribe((event: SortEvent) => {
      this.sortAsc = (event.sortBy === this.sortBy && event.sortOrder === Sort.ASC);
      this.sortDesc = (event.sortBy === this.sortBy && event.sortOrder === Sort.DSC);
    });
  }

  sort() {
    let order = this.sortAsc ? Sort.DSC : Sort.ASC;
    this.dpTable.setSort({sortBy: this.sortBy, sortOrder: order, type: this.type});
  }
}
