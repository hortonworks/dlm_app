import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { User } from 'models/user.model';
import { TimeZoneService } from 'services/time-zone.service';

@Component({
  selector: 'user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserDropdownComponent implements OnInit {

  @Input()
  user: User;

  @Output()
  timezoneChanged: EventEmitter<any> = new EventEmitter();

  @Output()
  logout: EventEmitter<any> = new EventEmitter();

  timezoneValue = [{id: '', text: ''}];
  timeZoneOptions = [];

  constructor(private timeZoneService: TimeZoneService) {
    this.timeZoneOptions = this.timeZoneService.parsedTimezones.map(tz => ({id: tz.value, text: tz.label}));
  }

  onTimezoneSelect(value) {
    this.timezoneChanged.emit(value.id);
  }

  ngOnInit() {
    const tz = this.user.timezone;
    this.timezoneValue = [{id: tz, text: this.timeZoneService.mappedByValueTimezones[tz].label}];
  }

  doLogout() {
    this.logout.emit();
  }

}
