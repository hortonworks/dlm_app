/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClusterCardComponent } from 'components/cluster-card/cluster-card.component';
import { CreatePairingCardComponent } from './create-pairing-card.component';
import { Cluster } from 'models/cluster.model';
import { TooltipModule } from 'ng2-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { PipesModule } from 'pipes/pipes.module';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';

describe('CreatePairingCardComponent', () => {
  let component: CreatePairingCardComponent;
  let fixture: ComponentFixture<CreatePairingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TooltipModule.forRoot(), TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        PipesModule
      ],
      declarations: [CreatePairingCardComponent, ClusterCardComponent],
      providers: [BytesSizePipe]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePairingCardComponent);
    component = fixture.componentInstance;
    component.cluster = <Cluster>{
      id: 1,
      location: {},
      stats: {CapacityUsed: 1, CapacityRemaining: 4, CapacityTotal: 5}
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
