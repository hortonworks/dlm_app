import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { go } from '@ngrx/router-store';
import { createPolicy } from 'actions/policy.action';
import { State } from 'reducers';
import { initApp } from 'actions/app.action';
import { Pairing } from 'models/pairing.model';
import { getAllPairings } from 'selectors/pairing.selector';
import { loadPairings } from 'actions/pairing.action';
import { saveFormValue } from 'actions/form.action';

import { POLICY_FORM_ID } from '../../components/policy-form/policy-form.component';

@Component({
  selector: 'dp-create-policy',
  template: `
    <dlm-page-header [title]="'page.policies.header_create'"></dlm-page-header>
    <div class="page-section">
      <dlm-policy-form
        [pairings]="pairings$ | async"
        (formSubmit)="handleFormSubmit($event)"
        >
      </dlm-policy-form>
    </div>
  `,
  styleUrls: ['./create-policy.component.scss']
})
export class CreatePolicyComponent implements OnInit {
  pairings$: Observable<Pairing[]>;

  constructor(private store: Store<State>) {
    this.pairings$ = this.store.select(getAllPairings);
  }

  ngOnInit() {
    this.store.dispatch(loadPairings());
  }

  handleFormSubmit(values) {
    this.store.dispatch(saveFormValue(POLICY_FORM_ID, values));
    this.store.dispatch(go(['policies/review']));
  }

}
