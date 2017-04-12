import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from './infra.routes';
import { LakesComponent } from './views/lakes/lakes.component';

@NgModule({
  imports: [
    CommonModule,

    RouterModule.forChild(routes),
  ],
  declarations: [
    LakesComponent,
  ]
})
export class InfraModule { }
