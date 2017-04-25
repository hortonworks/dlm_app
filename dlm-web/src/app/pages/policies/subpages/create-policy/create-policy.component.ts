import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { go } from '@ngrx/router-store';
import { createPolicy } from 'actions/policy.action';
import { State } from 'reducers';
import { initApp } from 'actions/app.action';
import { saveFormValue } from 'actions/form.action';

import { POLICY_FORM_ID } from '../../components/policy-form/policy-form.component';

@Component({
  selector: 'dp-create-policy',
  template: `
    <h2>
      {{'page.policies.header_create' | translate}}
    </h2>
    <dlm-policy-form (formSubmit)="handleFormSubmit($event)">
    </dlm-policy-form>
  `,
  styleUrls: ['./create-policy.component.scss']
})
export class CreatePolicyComponent implements OnInit {

  constructor(private store: Store<State>) { }

  ngOnInit() {
  }

  handleFormSubmit(values) {
    this.store.dispatch(saveFormValue(POLICY_FORM_ID, values));
    this.store.dispatch(go(['policies/review']));
  }

}
