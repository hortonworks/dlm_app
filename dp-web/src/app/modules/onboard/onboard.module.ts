import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecurityComponent } from './views/security/security.component';
import { LakesComponent } from './views/lakes/lakes.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SecurityComponent,
    LakesComponent,
  ]
})
export class OnboardModule { }
