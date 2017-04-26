import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {getAllJobs} from '../../selectors/job.selector';
import * as fromRoot from '../../reducers';
import {Job} from '../../models/job.model';
import {Observable} from 'rxjs/Observable';
import {loadJobs} from '../../actions/job.action';
import {DropdownItem} from '../../components/dropdown/dropdown-item';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'dp-main',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {

  jobs$: Observable<Job[]>;

  addOptions: DropdownItem[] = [
    {label: 'Cluster', path: '../clusters/create'},
    {label: 'Policy', path: '../policies/create'},
    {label: 'Pairing', path: '../pairings/create'}
  ];

  constructor(private store: Store<fromRoot.State>,
              private router: Router,
              private route: ActivatedRoute) {
    this.jobs$ = store.select(getAllJobs);
  }

  ngOnInit() {
    this.store.dispatch(loadJobs());
  }

  handleAddSelected(option: DropdownItem) {
    this.router.navigate([option.path], {relativeTo: this.route});
  }

}
