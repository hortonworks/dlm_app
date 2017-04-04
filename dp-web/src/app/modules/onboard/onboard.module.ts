import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecurityComponent } from './routes/security/security.component';
import { LakesComponent } from './routes/lakes/lakes.component';

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
