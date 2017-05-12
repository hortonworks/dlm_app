import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { JobsStatusFilterComponent } from './jobs-status-filter.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MockTranslateLoader } from '../../../mocks/mock-translate-loader';
import { JobStatusComponent } from '../job-status/job-status.component';

describe('TableFilterComponent', () => {
  let component: JobsStatusFilterComponent;
  let fixture: ComponentFixture<JobsStatusFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      })],
      declarations: [JobsStatusFilterComponent, JobStatusComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsStatusFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
