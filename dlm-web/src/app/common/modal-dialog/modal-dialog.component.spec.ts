import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalDialogComponent } from './modal-dialog.component';
import { ModalModule } from 'ng2-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MockTranslateLoader } from '../../mocks/mock-translate-loader';

describe('ModalDialogComponent', () => {
  let component: ModalDialogComponent;
  let fixture: ComponentFixture<ModalDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalModule.forRoot(),
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
      ],
      declarations: [ ModalDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
