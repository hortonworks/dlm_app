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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap';
import { CommonComponentsModule} from 'components/common-components.module';
import { TranslateModule } from '@ngx-translate/core';
import { ResourceSummaryComponent } from './resource-summary/resource-summary.component';
import { ClustersSummaryComponent } from './resource-summary/clusters-summary/clusters-summary.component';
import { JobsSummaryComponent } from './resource-summary/jobs-summary/jobs-summary.component';
import { PoliciesSummaryComponent } from './resource-summary/policies-summary/policies-summary.component';
import { SummaryPanelComponent } from './resource-summary/summary-panel/summary-panel.component';
import { SummaryPanelCellComponent } from './resource-summary/summary-panel-cell/summary-panel-cell.component';
import { LastTenJobsColumnComponent } from './jobs-overview-table/last-ten-jobs-column/last-ten-jobs-column.component';
import { ClusterLegendComponent } from './cluster-legend/cluster-legend.component';

@NgModule({
  imports: [
    CommonModule,
    CommonComponentsModule,
    TranslateModule,
    TooltipModule.forRoot()
  ],
  declarations: [
    ResourceSummaryComponent,
    ClustersSummaryComponent,
    JobsSummaryComponent,
    PoliciesSummaryComponent,
    SummaryPanelComponent,
    SummaryPanelCellComponent,
    LastTenJobsColumnComponent,
    ClusterLegendComponent
  ],
  exports: [
    ResourceSummaryComponent,
    ClustersSummaryComponent,
    JobsSummaryComponent,
    PoliciesSummaryComponent,
    SummaryPanelComponent,
    SummaryPanelCellComponent,
    LastTenJobsColumnComponent,
    ClusterLegendComponent
  ]
})
export class OverviewModule { }
