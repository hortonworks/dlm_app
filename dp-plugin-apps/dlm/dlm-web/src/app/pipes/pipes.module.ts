import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BytesSizePipe } from './bytes-size.pipe';
import { FmtTzPipe } from './fmt-tz.pipe';
import { FrequencyPipe } from './frequency.pipe';
import { TruncatePipe } from './truncate.pipe';
import { StatusFmtPipe } from './status-fmt.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    BytesSizePipe,
    FmtTzPipe,
    FrequencyPipe,
    TruncatePipe,
    StatusFmtPipe
  ],
  exports: [
    BytesSizePipe,
    FmtTzPipe,
    FrequencyPipe,
    TruncatePipe,
    StatusFmtPipe
  ]
})
export class PipesModule {}
