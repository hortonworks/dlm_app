import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export enum TabStyleType {
  UNDERLINE, BUTTON, LAYOUT
}

@Component({
  selector: 'dp-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})

export class TabsComponent implements OnChanges {
  @Input() tabType: TabStyleType = TabStyleType.UNDERLINE;
  @Input() tabEnum: any;
  @Input() images = {};
  @Input() activeTabName: string = '';
  @Output() selected = new EventEmitter<string>();

  tabNames: string[] = [];
  //activeTabName: string = '';
  tabTypes = TabStyleType;
  imagesLength = 0;

  onTabSelect(name: string) {
    this.activeTabName = name;
    this.selected.emit(this.tabEnum[this.activeTabName]);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tabEnum'] && changes['tabEnum'].currentValue) {
      let keys: any = Object.keys(changes['tabEnum'].currentValue);
      this.tabNames = keys.filter(v => { return isNaN(v); });
    }

    if (changes['images'] && changes['images'].currentValue) {
      this.imagesLength = Object.keys(this.images).length;
    }
  }
}
