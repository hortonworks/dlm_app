/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'reducers';
import { CreatePolicyModalComponent } from '../../components/create-policy-modal/create-policy-modal.component';

@Component({
  selector: 'dlm-create-policy',
  template: `<dlm-create-policy-modal #createPolicyModal></dlm-create-policy-modal>`
})
export class CreatePolicyComponent implements AfterViewInit {
  @ViewChild('createPolicyModal') createPolicyModal: CreatePolicyModalComponent;
  constructor(private store: Store<State>) {}

  ngAfterViewInit() {
    this.createPolicyModal.show();
  }
}
