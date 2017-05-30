import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {TranslateModule} from '@ngx-translate/core';

import { NguiAutoCompleteModule } from '@ngui/auto-complete';

import { routes } from './infra.routes';
import { LakesComponent } from './views/lakes/lakes.component';
import { ClusterAddComponent } from './views/cluster-add/cluster-add.component';

import { LakeStatsComponent } from './widgets/lake-stats/lake-stats.component';
import { LakesListComponent } from './widgets/lakes-list/lakes-list.component';
import { MapComponent } from './widgets/map/map.component';
import {TaggingWidgetModule} from "../../shared/tagging-widget/tagging-widget.module";
import {CollapsibleNavModule} from '../../shared/collapsible-nav/collapsible-nav.modue';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    NguiAutoCompleteModule,
    TaggingWidgetModule,
    CollapsibleNavModule,
    TranslateModule
  ],

  declarations: [
    LakesComponent,
    ClusterAddComponent,
    LakeStatsComponent,
    LakesListComponent,
    MapComponent
  ]
})
export class InfraModule { }
