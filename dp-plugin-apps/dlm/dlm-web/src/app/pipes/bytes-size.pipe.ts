import {Pipe, PipeTransform} from '@angular/core';
import { bytesToSize } from 'utils/size-util';

/**
 * https://gist.github.com/JonCatmull/ecdf9441aaa37336d9ae2c7f9cb7289a
 * Convert bytes into largest possible unit.
 * Takes an precision argument that defaults to 2.
 * Usage:
 *   <span [innerHTML]="bytes | fileSize:precision"></span>
 *
 */
@Pipe({name: 'bytesSize'})
export class BytesSizePipe implements PipeTransform {


  transform(bytes: number = 0, precision: number = 2): string {
    return bytesToSize(bytes, precision);
  }
}
