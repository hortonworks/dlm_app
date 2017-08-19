/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BytesSizePipe } from './bytes-size.pipe';
import { FmtTzPipe } from './fmt-tz.pipe';
import { FrequencyPipe } from './frequency.pipe';
import { TruncatePipe } from './truncate.pipe';
import { StatusFmtPipe } from './status-fmt.pipe';
import { JobStatusFmtPipe } from './job-status-fmt.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    BytesSizePipe,
    FmtTzPipe,
    FrequencyPipe,
    TruncatePipe,
    StatusFmtPipe,
    JobStatusFmtPipe
  ],
  exports: [
    BytesSizePipe,
    FmtTzPipe,
    FrequencyPipe,
    TruncatePipe,
    StatusFmtPipe,
    JobStatusFmtPipe
  ]
})
export class PipesModule {}
