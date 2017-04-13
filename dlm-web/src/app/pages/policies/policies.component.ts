import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { LoadPolicies } from '../../actions/policy';
import { Policy } from '../../models/policy.model';
import { DropdownItem } from '../../components/dropdown/dropdown-item';
import { getAllPolicies } from '../../selectors/policy';
import * as fromRoot from '../../reducers';

@Component({
  selector: 'dp-main',
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent implements OnInit {
  policies$: Observable<Policy[]>;
  addOptions: DropdownItem[] = [
    { label: 'Cluster', path: '../clusters/create' },
    { label: 'Policy', path: 'create' }
  ];

  constructor(
    private store: Store<fromRoot.State>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.policies$ = store.select(getAllPolicies);
  }

  ngOnInit() {
    this.store.dispatch(new LoadPolicies());
  }

  handleAddSelected(option: DropdownItem) {
    this.router.navigate([option.path], {relativeTo: this.route});
  }

}
