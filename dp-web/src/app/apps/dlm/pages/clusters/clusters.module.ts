import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonComponentsModule } from '../../components/common-components.module';
import { ClustersComponent } from './clusters.component';
import { ClusterCardComponent } from './cluster-card/cluster-card.component';
import { ClusterListComponent } from './cluster-list/cluster-list.component';
import { ClusterSearchComponent } from './cluster-search/cluster-search.component';

@NgModule({
  imports: [
    CommonModule,
    CommonComponentsModule
  ],
  declarations: [
    ClustersComponent,
    ClusterCardComponent,
    ClusterListComponent,
    ClusterSearchComponent
  ],
  exports: [
    ClustersComponent,
    ClusterCardComponent,
    ClusterListComponent,
    ClusterSearchComponent
  ]
})
export class ClustersModule { }
