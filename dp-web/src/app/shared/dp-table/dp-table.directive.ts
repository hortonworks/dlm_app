import {Directive, Output, Input, EventEmitter, ElementRef, AfterViewInit} from '@angular/core';
import {Sort} from '../utils/enums';

export interface SortEvent {
  sortBy: string;
  type: string;
  sortOrder: Sort;
}

@Directive({
  selector: '[dp-config-table]'
})

export class DpTableDirective implements AfterViewInit {

  @Output() onSort = new EventEmitter<SortEvent>();
  @Input() data: any[] = [];
  @Input() cellSelectable = false;
  rowhighlightColor = '#333333';
  highlightColor = '#0F4450';
  border = '1px solid #1B596C';

  onSortColumnChange = new EventEmitter<SortEvent>();

  constructor(private element: ElementRef) { }

  private getParentTR(parent: any) {
    while (true) {
      if (parent == null) {
        return;
      }
      if (parent.nodeName === 'TR') {
        return parent;
      }
      parent = parent.parentNode;
    }
  }

  mouseover($event) {
    if ($event.target.nodeName === 'TH') {
      return;
    }

    if (this.cellSelectable && $event.target.nodeName === 'A') {
        $event.target.style.backgroundColor = this.highlightColor;
        $event.target.style.border = this.border;

    } else {
        let parent = this.getParentTR($event.target);
        parent.style.backgroundColor = this.rowhighlightColor;
    }
  }

  mouseleave($event) {
    if ($event.target.nodeName === 'TH') {
      return;
    }

    $event.target.style.border = '';
    $event.target.style.backgroundColor = '';

    let parent = this.getParentTR($event.target);
    parent.style.backgroundColor = '';
  }

  ngAfterViewInit() {
    this.element.nativeElement.querySelector('tbody').addEventListener('mouseover', this.mouseover.bind(this));
    this.element.nativeElement.querySelector('tbody').addEventListener('mouseout', this.mouseleave.bind(this));
  }


  public setSort(sortEvent: SortEvent): void {
    this.onSortColumnChange.emit(sortEvent);
    if (this.onSort.observers.length === 0 ) {
      this.sort(sortEvent);
    } else {
      this.onSort.emit(sortEvent);
    }
  }

  private sort($event) {
    this.data.sort((obj1: any, obj2: any) => {
      if ($event.sortOrder === Sort.ASC) {
        if ($event.type === 'string') {
          return obj1[$event.sortBy].localeCompare(obj2[$event.sortBy]);
        }
        if ($event.type === 'number') {
          return obj1[$event.sortBy] - obj2[$event.sortBy];
        }
      }

      if ($event.type === 'string') {
        return obj2[$event.sortBy].localeCompare(obj1[$event.sortBy]);
      }
      if ($event.type === 'number') {
        return obj2[$event.sortBy] - obj1[$event.sortBy];
      }
    });
  }
}
