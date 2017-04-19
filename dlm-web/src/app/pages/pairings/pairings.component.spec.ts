import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {PairingsComponent} from './pairings.component';
import {RouterTestingModule} from '@angular/router/testing';
import {MockTranslateLoader} from '../../mocks/mock-translate-loader';

describe('PairingsComponent', () => {
  let component: PairingsComponent;
  let fixture: ComponentFixture<PairingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }), RouterTestingModule],
      declarations: [PairingsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
