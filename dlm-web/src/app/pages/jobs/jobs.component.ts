import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {getAllJobs} from '../../selectors/job.selector';
import * as fromRoot from '../../reducers';
import {Job} from '../../models/job.model';
import {Observable} from 'rxjs/Observable';
import {loadJobs} from '../../actions/job.action';

@Component({
  selector: 'dp-main',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {

  jobs$: Observable<Job[]>;

  constructor(private store: Store<fromRoot.State>) {
    this.jobs$ = store.select(getAllJobs);
  }

  ngOnInit() {
    this.store.dispatch(loadJobs());
  }

}
