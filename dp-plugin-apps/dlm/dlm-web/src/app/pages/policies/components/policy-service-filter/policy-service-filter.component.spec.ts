import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PolicyServiceFilterComponent } from './policy-service-filter.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MockTranslateLoader } from '../../../../mocks/mock-translate-loader';

describe('TableFilterComponent', () => {
  let component: PolicyServiceFilterComponent;
  let fixture: ComponentFixture<PolicyServiceFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      })],
      declarations: [PolicyServiceFilterComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyServiceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
