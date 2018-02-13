import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';
import {StarRatingModule} from 'angular-star-rating';

import {CommentsComponent} from './comments.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    StarRatingModule.forRoot()
  ],
  declarations: [CommentsComponent],
  exports: [CommentsComponent]
})
export class CommentsModule { }
