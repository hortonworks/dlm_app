/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'ng2-select';
import { UserDropdownComponent } from './user-dropdown.component';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { TimeZoneService } from 'services/time-zone.service';
import { MockTimeZoneService } from 'mocks/mock-timezone';
import { User } from 'models/user.model';

describe('UserDropdownComponent', () => {
  let component: UserDropdownComponent;
  let fixture: ComponentFixture<UserDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), SelectModule],
      declarations: [UserDropdownComponent],
      providers: [
        {provide: TimeZoneService, useClass: MockTimeZoneService}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDropdownComponent);
    component = fixture.componentInstance;
    component.user = <User>{timezone: 'fake-zone'};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
