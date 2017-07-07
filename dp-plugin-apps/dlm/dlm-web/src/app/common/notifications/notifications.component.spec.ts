import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationsComponent } from './notifications.component';
import { MockStore } from '../../mocks/mock-store';
import { Store } from '@ngrx/store';
import { MomentModule } from 'angular2-moment';
import { MockTranslateLoader } from '../../mocks/mock-translate-loader';
import { RouterTestingModule } from '@angular/router/testing';
import { NavbarService } from 'services/navbar.service';
import { CommonComponentsModule } from 'components/common-components.module';
import { PipesModule } from 'pipes/pipes.module';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
      }),
        ReactiveFormsModule,
        RouterTestingModule,
        MomentModule,
        CommonComponentsModule,
        PipesModule
      ],
      declarations: [
        NotificationsComponent,
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        NavbarService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
