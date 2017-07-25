import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { JobsStatusFilterComponent } from './jobs-status-filter.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MockTranslateLoader } from '../../../mocks/mock-translate-loader';
import { TooltipModule } from 'ng2-bootstrap';
import { CommonComponentsModule } from 'components/common-components.module';

describe('TableFilterComponent', () => {
  let component: JobsStatusFilterComponent;
  let fixture: ComponentFixture<JobsStatusFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TooltipModule.forRoot(), TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), CommonComponentsModule],
      declarations: [JobsStatusFilterComponent]
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
