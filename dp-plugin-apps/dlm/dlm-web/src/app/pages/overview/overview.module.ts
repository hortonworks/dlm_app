import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'ng2-bootstrap';
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
