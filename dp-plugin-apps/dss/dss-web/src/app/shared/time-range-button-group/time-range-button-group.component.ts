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
import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output,
  SimpleChanges
} from '@angular/core';
import * as moment from 'moment';

const validFormats = ['D', 'W', 'M', 'Y'];
export var TIME_RANGE_FORMAT = 'YYYY-MM-DD';

class TimeRangeButtonGroupData {
  displayName: string;
  isActive: boolean;

  constructor(displayName: string, isActive = false) {
    this.displayName = displayName;
    this.isActive = isActive;
  }
}

@Component({
  selector: 'dss-time-range-button-group',
  templateUrl: './time-range-button-group.component.html',
  styleUrls: ['./time-range-button-group.component.scss']
})
export class TimeRangeButtonGroupComponent implements OnChanges {

  @Input() formats: ('D' | 'W' | 'M' | 'Y')[] = [];
  @Output('change') change = new EventEmitter<[string, string]>();

  displayValues: TimeRangeButtonGroupData[] = [];
  toDate = '';
  fromDate = '';

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['formats'] && changes['formats'].currentValue) {
      this.render();
    }
  }

  private render() {
    this.formats = this.formats.filter(f => validFormats.indexOf(f) > -1);
    this.displayValues = this.formats.map(f => new TimeRangeButtonGroupData(f));
    this.selectTimeRange(this.displayValues[0]);
  }

  selectTimeRange(button: TimeRangeButtonGroupData) {
    this.displayValues.forEach(d => (d.isActive = false));
    button.isActive = true;

    this.toDate = '';
    this.fromDate = '';
    switch (button.displayName) {
      case 'D':
        this.fromDate = moment().subtract(1, 'days').endOf('day').local().format(TIME_RANGE_FORMAT);
        this.toDate = moment().startOf('day').local().format(TIME_RANGE_FORMAT);
        break;
      case 'W':
        this.fromDate = moment().subtract(8, 'days').startOf('day').local().format(TIME_RANGE_FORMAT);
        this.toDate = moment().subtract(1, 'days').endOf('day').local().format(TIME_RANGE_FORMAT);
        break;
      case 'M':
        this.fromDate = moment().subtract(30, 'days').startOf('day').local().format(TIME_RANGE_FORMAT);
        this.toDate = moment().subtract(1, 'days').endOf('day').local().format(TIME_RANGE_FORMAT);
        break;
      case 'Y':
        this.fromDate = moment().subtract(365, 'days').startOf('day').local().format(TIME_RANGE_FORMAT);
        this.toDate = moment().subtract(1, 'days').endOf('day').local().format(TIME_RANGE_FORMAT);
        break;

    }

    if (this.fromDate.length > 0 && this.toDate.length > 0) {
      this.change.emit([this.fromDate, this.toDate]);
    }
  }
}
