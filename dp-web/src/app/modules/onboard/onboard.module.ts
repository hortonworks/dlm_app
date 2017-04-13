import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from './onboard.routes';

import { FirstRunComponent } from './views/first-run/first-run.component';
import { LakesComponent } from './views/lakes/lakes.component';
import { SecurityComponent } from './views/security/security.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,

    RouterModule.forChild(routes),
  ],
  declarations: [
    FirstRunComponent,
    SecurityComponent,
    LakesComponent,
  ]
})
export class OnboardModule { }
