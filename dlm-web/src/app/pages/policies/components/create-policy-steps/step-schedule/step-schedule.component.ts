/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import {
  Component, Output, OnInit, ViewEncapsulation, EventEmitter,
  HostBinding, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers/index';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { FormGroup, Validators, FormBuilder, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  POLICY_REPEAT_MODES, POLICY_TYPES, POLICY_TIME_UNITS, POLICY_START,
  POLICY_DAYS
} from 'constants/policy.constant';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from 'components/forms/select-field';
import { RadioItem } from 'common/radio-button/radio-button';
import { IMyDateModel, IMyInputFieldChanged, IMyOptions } from 'mydatepicker';
import { getDatePickerDate } from 'utils/date-util';
import { TimeZoneService } from 'services/time-zone.service';
import * as moment from 'moment-timezone';
import { markAllTouched } from 'utils/form-util';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

export function freqValidator(frequencyMap): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    const parent = control.parent;
    if (!parent || !isInteger(control.value)) {
      return null;
    }
    const unit = parent.controls['unit'].value;
    const value = frequencyMap[unit] * control.value;
    // 2147472000 - 24855 days in seconds. closest days number to integer size
    return value < 2147472000 ? null : {'freqValidator': {name: control.value}};
  };
}

function isInteger(value: string): boolean {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0;
}

export function integerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    const {value} = control;
    if (!value) {
      return null;
    }
    return isInteger(value) ? null : {'integerValidator': {name: value}};
  };
}

@Component({
  selector: 'dlm-step-schedule',
  templateUrl: './step-schedule.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepScheduleComponent implements OnInit, OnDestroy, StepComponent {

  @Output() onFormValidityChange = new EventEmitter<boolean>();
  @HostBinding('class') className = 'dlm-step-schedule';
  policyRepeatModes = POLICY_REPEAT_MODES;
  policyTimeUnits = POLICY_TIME_UNITS;
  policyDays = POLICY_DAYS;
  policyStart = POLICY_START;
  freqRequired = {fieldLabel: 'Frequency'};
  freqLimit = {fieldLabel: 'Frequency'};
  startTimeDateField = {fieldLabel: 'Start Date'};
  endTimeDateField = {fieldLabel: 'End Date'};
  userTimezone = '';
  userTimeZone$: BehaviorSubject<any>;
  subscriptions: Subscription[] = [];
  selectedStart = this.policyStart.ON_SCHEDULE;

  get datePickerOptions(): IMyOptions {
    const yesterday = moment().subtract(1, 'day');
    const today = moment();
    return {
      dateFormat: 'yyyy-mm-dd',
      disableUntil: getDatePickerDate(yesterday),
      showTodayBtn: false,
      markCurrentDay: false,
      markDates: [{
        dates: [getDatePickerDate(today)],
        color: '#ff0000'
      }]
    };
  }

  frequencyMap = {
    [this.policyTimeUnits.MINUTES]: 60,
    [this.policyTimeUnits.HOURS]: 60 * 60,
    [this.policyTimeUnits.DAYS]: 24 * 60 * 60,
    [this.policyTimeUnits.WEEKS]: 7 * 24 * 60 * 60
  };
  repeatOptions = <SelectOption[]> [
    {
      label: this.t.instant('common.frequency.every'),
      value: this.policyRepeatModes.EVERY
    }
  ];
  units = <SelectOption[]> [
    {
      label: this.t.instant('common.time.weeks'),
      value: this.policyTimeUnits.WEEKS
    },
    {
      label: this.t.instant('common.time.days'),
      value: this.policyTimeUnits.DAYS
    },
    {
      label: this.t.instant('common.time.hours'),
      value: this.policyTimeUnits.HOURS
    },
    {
      label: this.t.instant('common.time.minutes'),
      value: this.policyTimeUnits.MINUTES
    }
  ];
  startOptions = <RadioItem[]> [
    {
      label: this.t.instant('page.policies.form.fields.start.schedule'),
      value: this.policyStart.ON_SCHEDULE
    },
    {
      label: this.t.instant('page.policies.form.fields.start.start_now'),
      value: this.policyStart.START_NOW
    }
  ];
  dayOptions = <RadioItem[]> [
    {
      label: 'Mo',
      value: this.policyDays.MONDAY
    },
    {
      label: 'Tu',
      value: this.policyDays.TUESDAY
    },
    {
      label: 'We',
      value: this.policyDays.WEDNESDAY
    },
    {
      label: 'Th',
      value: this.policyDays.THURSDAY
    },
    {
      label: 'Fr',
      value: this.policyDays.FRIDAY
    },
    {
      label: 'Sa',
      value: this.policyDays.SATURDAY
    },
    {
      label: 'Su',
      value: this.policyDays.SUNDAY
    }
  ];

  get defaultTime(): Date {
    const date = moment();
    date.hours(0);
    date.minutes(0);
    date.seconds(0);
    return date.toDate();
  }

  get defaultEndTime(): Date {
    const date = moment();
    date.hours(23);
    date.minutes(59);
    date.seconds(59);
    return date.toDate();
  }

  get selectedDay() {
    return this.form.value.job.day;
  }

  get startOption() {
    return this.form.value.job.start;
  }

  get repeatOption() {
    return this.form.value.job.repeatMode;
  }

  get unit() {
    return this.form.value.job.unit;
  }

  form: FormGroup;

  constructor(private store: Store<State>,
              private formBuilder: FormBuilder,
              private t: TranslateService,
              private timezoneService: TimeZoneService) {
  }

  private setupTimeZoneChanges(): void {
    this.userTimeZone$ = this.timezoneService.userTimezoneIndex$;
    const updateUserTimezone = this.userTimeZone$.subscribe((value) =>
      this.userTimezone = this.timezoneService.userTimezone ? this.timezoneService.userTimezone.label : '');
    this.subscriptions.push(updateUserTimezone);
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      job: this.formBuilder.group({
        start: this.policyStart.ON_SCHEDULE,
        repeatMode: this.policyRepeatModes.EVERY,
        frequency: ['', Validators.compose([Validators.required, freqValidator(this.frequencyMap), integerValidator()])],
        day: this.policyDays.MONDAY,
        frequencyInSec: 0,
        unit: this.policyTimeUnits.DAYS,
        endTime: this.formBuilder.group({
          date: [''],
          time: [this.defaultEndTime]
        }, {validator: this.validateTime}),
        startTime: this.formBuilder.group({
          date: [''],
          time: [this.defaultTime]
        }, {validator: this.validateTime})
      }),
      userTimezone: ['']
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }

  ngOnInit() {
    this.form = this.initForm();
    this.form.valueChanges.map(_ => this.isFormValid()).distinctUntilChanged()
      .skip(1) // allow to skip calling `onFormValidityChange` from patchValue in the `presetJobTime` (it happens only on form init)
      .subscribe(isFormValid => this.onFormValidityChange.emit(isFormValid));
    this.setupTimeZoneChanges();
    this.presetJobTime(this.form);
    this.setupUnitChanges(this.form);
    this.setupStartModeChanges(this.form);
  }

  isFormValid() {
    return this.form.valid;
  }

  getFormValue() {
    this.handleSubmit(this.form);
    return this.form.value;
  }

  getEndTime(endDate) {
    const date = endDate ? moment(endDate).toDate() : new Date();
    date.setHours(23, 59, 59);
    return new Date(date);
  }

  private presetJobTime(form) {
    form.patchValue({
      job: {
        endTime: {
          time: moment(this.defaultEndTime).toDate()
        },
        startTime: {
          time: moment(this.defaultTime).toDate()
        }
      }
    });
  }

  private setupUnitChanges(form: FormGroup) {
    const unitChanges$: Observable<string> = form.get('job.unit').valueChanges.distinctUntilChanged();
    const unitChangeSubscription = unitChanges$.subscribe(_ => {
      this.updateDateControlValidators(form);
    });
    this.subscriptions.push(unitChangeSubscription);
  }

  private setupStartModeChanges(form: FormGroup) {
    const startModeChanges$: Observable<string> = form.get('job.start').valueChanges.distinctUntilChanged();
    const startModeSubscription = startModeChanges$.subscribe(_ => {
      this.updateDateControlValidators(form);
    });
    this.subscriptions.push(startModeSubscription);
  }

  private updateDateControlValidators(form) {
    const unit = form.get('job.unit').value;
    const startMode = form.get('job.start').value;
    const dateControl = form.get('job.startTime.date');
    if (unit === this.policyTimeUnits.WEEKS) {
      // Make the start time field as not mandatory when policy is scheduled to start now
      if (startMode === this.policyStart.START_NOW) {
        dateControl.clearValidators();
        dateControl.updateValueAndValidity();
      } else {
        dateControl.setValidators(Validators.required);
        dateControl.updateValueAndValidity();
      }
    } else {
      dateControl.clearValidators();
      dateControl.updateValueAndValidity();
    }
  }

  validateTime = (formGroup: FormGroup) => {
    if (!(formGroup && formGroup.controls && formGroup.parent)) {
      return null;
    }
    const parentControls = formGroup.parent.controls;
    const startTimeValue = parentControls['startTime'].value.date;
    const endTimeValue = parentControls['endTime'].value.date;
    const timeControl = parentControls['startTime'].controls.time;
    const dateFieldValue = formGroup.controls.date.value;
    const timeFieldValue = timeControl.value;
    timeControl.setErrors(null);
    if (dateFieldValue && this.startOption === this.policyStart.ON_SCHEDULE) {
      const mDate = moment(dateFieldValue);
      if (this.form && this.form.controls['job']['controls'].unit) {
        const jobControls = this.form.controls['job']['controls'];
        const unit = jobControls.unit.value;
        if (unit === this.policyTimeUnits.WEEKS) {
          const startTimeDay = mDate.day();
          const scheduledDay = jobControls.day.value;
          if (scheduledDay > startTimeDay) {
            mDate.add(scheduledDay - startTimeDay, 'days'); // first day will be on this week
          } else {
            mDate.add(7 - scheduledDay, 'days'); // first day will be on next week
          }
        }
      }
      const dateWithTime = this.setTimeForDate(mDate.format(), timeFieldValue);
      if (dateWithTime.isBefore(moment())) {
        timeControl.setErrors({lessThanCurrent: true});
        return null;
      }
      if (startTimeValue && endTimeValue && moment(endTimeValue).isBefore(moment(startTimeValue))) {
        timeControl.setErrors({greaterThanEndTime: true});
        return null;
      }
    }
    return null;
  }

  private setTimeForDate(date: string, time: string) {
    const dateValue = moment(date);
    const timeValue = new Date(time);
    dateValue.hours(timeValue.getHours());
    dateValue.minutes(timeValue.getMinutes());
    dateValue.seconds(0);
    return dateValue;
  }

  handleDateChange(date: IMyDateModel, dateType: string) {
    if (date.formatted) { // valid date
      this.form.patchValue({job: {[dateType]: {date: date.formatted}}});
    } else if (date.jsdate === null) {
      // reset date to empty value
      this.form.patchValue({job: {[dateType]: {date: ''}}});
    }
  }

  handleDateInputChange(field: IMyInputFieldChanged, dateType: string): void {
    const control: AbstractControl = this.form.get('job').get(dateType).get('date');
    control.setErrors(field.valid || field.value === '' ? null : {
      invalidDate: !field.valid
    });
  }

  handleStartChange(radioItem) {
    const {value} = radioItem;
    this.form.patchValue({
      job: {
        start: value,
        startTime: {
          time: moment(this.defaultTime).toDate()
        }
      }
    });
    if (value === this.policyStart.START_NOW) {
      const userTimezone = this.timezoneService.userTimezone;
      const day = userTimezone ? moment().tz(userTimezone.zones[0].value).format('d') : moment().format('d');
      this.form.patchValue({
        job: {day}
      });
    }
  }

  handleDayChange(radioItem: RadioItem) {
    const {value} = radioItem;
    this.form.patchValue({
      job: {
        day: value
      }
    });
  }

  handleSubmit({value}) {
    const userTimezone = this.timezoneService.userTimezone;
    if (this.form.valid) {
      if (value.job.repeatMode === this.policyRepeatModes.EVERY) {
        value.job.frequencyInSec = this.frequencyMap[value.job.unit] * value.job.frequency;
        // Modify the start date to next day chosen if unit is "weeks"
        if (value.job.unit === this.policyTimeUnits.WEEKS) {
          const dayToLook = +value.job.day;
          const startDate = value.job.startTime.date;
          // if we haven't yet passed the day of the week:
          if (moment(startDate).isoWeekday() <= dayToLook) {
            value.job.startTime.date = moment(startDate).isoWeekday(dayToLook).format('YYYY-MM-DD');
          } else {
            // otherwise, get next week's instance of that day
            value.job.startTime.date = moment(startDate).add(1, 'weeks').isoWeekday(dayToLook).format('YYYY-MM-DD');
          }
        }
        if (value.job.endTime && 'date' in value.job.endTime) {
          const endDate = value.job.endTime.date;
          value.job.endTime.time = this.getEndTime(endDate);
        }
      }
      if (value.job.start === this.policyStart.START_NOW) {
        value.job.startTime.date = '';
        value.job.startTime.time = '';
      }
      value.userTimezone = userTimezone ? userTimezone.label : '';
    }
    markAllTouched(this.form);
  }

}
