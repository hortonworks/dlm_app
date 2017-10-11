/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { ClusterCardComponent } from 'components/cluster-card/cluster-card.component';
import { CreatePairingCardComponent } from '../create-pairing-card/create-pairing-card.component';
import { CreatePairingCardListComponent } from './create-pairing-card-list.component';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { TooltipModule } from 'ng2-bootstrap';
import { HelpLinkComponent } from 'components/help-link/help-link.component';

describe('CreatePairingCardListComponent', () => {
  let component: CreatePairingCardListComponent;
  let fixture: ComponentFixture<CreatePairingCardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        TooltipModule.forRoot()
      ],
      declarations: [
        CreatePairingCardListComponent,
        CreatePairingCardComponent,
        ClusterCardComponent,
        HelpLinkComponent,
        BytesSizePipe
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePairingCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
