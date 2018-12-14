/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ClusterListComponent } from './cluster-list.component';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { TooltipModule } from 'ngx-bootstrap';
import { FeatureDirective } from 'directives/feature.directive';
import { FeatureService } from 'services/feature.service';
import { ClusterService } from 'services/cluster.service';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { clusterStub, storeStub, featureStub, userServiceStub } from 'testing/mock-services';
import { Store } from '@ngrx/store';
import { MockComponent } from 'testing/mock-component';
import { UserService } from 'services/user.service';

describe('ClusterListComponent', () => {
  let component: ClusterListComponent;
  let fixture: ComponentFixture<ClusterListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateTestingModule,
        TooltipModule.forRoot(),
      ],
      declarations: [
        ClusterListComponent,
        MockComponent({ selector: 'dlm-table', inputs: ['rowDetailHeight', 'rowDetailTemplate', 'theme', 'columns',
        'columnMode', 'footerOptions', 'rows'] }),
        MockComponent({ selector: 'dlm-cluster-status-icon', inputs: ['cluster'] }),
        MockComponent({ selector: 'dlm-cluster-actions', inputs: ['rowId', 'cluster', 'actions', 'clustersLength', 'availableActions'] }),
        MockComponent({ selector: 'dlm-hdfs-browser', inputs: ['rootPath', 'cluster', 'page'] }),
        MockComponent({ selector: 'dlm-spinner', inputs: ['size'] }),
        FeatureDirective
      ],
      providers: [
        BytesSizePipe,
        { provide: FeatureService, useValue: featureStub },
        { provide: ClusterService, useValue: clusterStub },
        { provide: Store, useValue: storeStub },
        { provide: UserService, useValue: userServiceStub },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
