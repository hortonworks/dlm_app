import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ResourceSummaryComponent } from './resource-summary/resource-summary.component';
import { ClustersSummaryComponent } from './resource-summary/clusters-summary/clusters-summary.component';
import { JobsSummaryComponent } from './resource-summary/jobs-summary/jobs-summary.component';
import { PoliciesSummaryComponent } from './resource-summary/policies-summary/policies-summary.component';
import { SummaryPanelComponent } from './resource-summary/summary-panel/summary-panel.component';
import { SummaryPanelCellComponent } from './resource-summary/summary-panel-cell/summary-panel-cell.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  declarations: [
    ResourceSummaryComponent,
    ClustersSummaryComponent,
    JobsSummaryComponent,
    PoliciesSummaryComponent,
    SummaryPanelComponent,
    SummaryPanelCellComponent
  ],
  exports: [
    ResourceSummaryComponent,
    ClustersSummaryComponent,
    JobsSummaryComponent,
    PoliciesSummaryComponent,
    SummaryPanelComponent,
    SummaryPanelCellComponent
  ]
})
export class OverviewModule { }
