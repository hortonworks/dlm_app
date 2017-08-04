/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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
