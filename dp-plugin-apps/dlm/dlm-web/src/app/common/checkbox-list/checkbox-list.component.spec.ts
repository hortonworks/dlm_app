/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule, TranslateService, TranslateLoader, TranslatePipe} from '@ngx-translate/core';
import {CheckboxListComponent} from './checkbox-list.component';
import {CheckboxComponent} from '../checkbox/checkbox.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MockTranslateLoader} from '../../mocks/mock-translate-loader';

describe('CheckboxListComponent', () => {
  let component: CheckboxListComponent;
  let fixture: ComponentFixture<CheckboxListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), ReactiveFormsModule],
      declarations: [CheckboxListComponent, CheckboxComponent],
      providers: [
        TranslatePipe,
        TranslateService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxListComponent);
    component = fixture.componentInstance;
    component.items = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
