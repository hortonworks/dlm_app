import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { go } from '@ngrx/router-store';
import { State } from 'reducers';
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
      <div *ngIf="(pairings$ | async)?.length > 0; else noPairs">
        <dlm-policy-form
          [pairings]="pairings$ | async"
          [sourceClusterId]="sourceClusterId"
          (formSubmit)="handleFormSubmit($event)"
          >
        </dlm-policy-form>
      </div>
      <ng-template #noPairs>
        <div>
          <div class="alert alert-warning" role="alert">
            {{ "page.pairings.content.no_pairs" | translate}}
            <button type="button" class="btn btn-primary" (click)="createPairingClickHandler()">
              {{ "page.pairings.create_button_text" | translate }}
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./create-policy.component.scss']
})
export class CreatePolicyComponent implements OnInit, OnDestroy {
  pairings$: Observable<Pairing[]>;
  loadParamsSubscription$;
  sourceClusterId: number;

  constructor(private store: Store<State>, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.store.dispatch(loadPairings());
    this.pairings$ = this.store.select(getAllPairings);
    this.loadParamsSubscription$ = this.route.queryParams
      .subscribe( params => {
        const clusterId = params['sourceClusterId'];
        if (clusterId) {
          this.sourceClusterId = clusterId;
        }
      });
  }

  handleFormSubmit(values) {
    this.store.dispatch(saveFormValue(POLICY_FORM_ID, values));
    this.store.dispatch(go(['policies/review']));
  }

  ngOnDestroy() {
    this.loadParamsSubscription$.unsubscribe();
  }

}
