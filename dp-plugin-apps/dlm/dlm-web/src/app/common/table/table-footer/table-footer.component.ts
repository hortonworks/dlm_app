import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {DropdownItem} from '../../../components/dropdown/dropdown-item';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'dlm-table-footer',
  templateUrl: './table-footer.component.html',
  styleUrls: ['./table-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFooterComponent {

  @Input() rowCount: number;
  @Input() pageSize: number;
  @Input() selectedCount: number;
  @Input() curPage: number;
  @Input() offset: number;
  @Input() limits: number[] = [10, 25, 50];
  @Output() changePageSize: EventEmitter<any> = new EventEmitter();
  @Output() changePage: EventEmitter<any> = new EventEmitter();

  get pageSizeOptions(): DropdownItem[] {
    return this.limits.map(limit => (<DropdownItem>{label: '' + limit, value: limit}));
  };

  get visibleRows(): number {
    return Math.min(this.rowCount - this.offset * this.pageSize, this.pageSize);
  };

  get summary(): string {
    return this.translate.instant('common.table.summary', {shown: this.visibleRows, count: this.rowCount});
  };

  get pagesCount(): number {
    const pagesCount = this.rowCount / this.pageSize;
    return (0 === pagesCount % 1) ? pagesCount : (Math.floor(pagesCount) + 1);
  }

  get paging(): string {
    const start = this.offset * this.pageSize + 1;
    let end = start - 1 + this.pageSize;
    end = Math.min(end, this.rowCount);
    return this.translate.instant('common.table.paging', {start, end, count: this.rowCount});
  }

  get nextDisabled(): boolean {
    return this.curPage >= this.pagesCount;
  }

  get prevDisabled(): boolean {
    return this.curPage === 1;
  }

  constructor(private translate: TranslateService) {
  }

  handleChangeLimit({value}) {
    this.changePageSize.emit(value);
    this.changePage.emit(1);
  }

  handleGoToNext() {
    this.changePage.emit(this.curPage + 1);
  }

  handleGoToPrev() {
    this.changePage.emit(this.curPage - 1);
  }

}
