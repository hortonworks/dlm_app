import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from './infra.routes';
import { LakesComponent } from './views/lakes/lakes.component';
import { LakeStatsComponent } from './widgets/lake-stats/lake-stats.component';
import { MapComponent } from './widgets/map/map.component';


@NgModule({
  imports: [
    CommonModule,

    RouterModule.forChild(routes),
  ],
  declarations: [
    LakesComponent,
    LakeStatsComponent,
    MapComponent
  ]
})
export class InfraModule { }
