import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class MockTimeZoneService {
  public userTimezoneIndex$: BehaviorSubject<any> = new BehaviorSubject('');
  parsedTimezones = [];
  mappedByValueTimezones = {
    'fake-zone': {}
  };

  getMomentTzByIndex() { }
  formatDateTimeWithTimeZone() {
  }
}
