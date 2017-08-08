/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';

export function truncate(value: string, maxNumber: number): string {
  return value && value.length > maxNumber ? value.slice(0, maxNumber - 3) + '...' : value;
}

/*
 * Truncate value if it is longer than maxNumber
 * Usage:
 *   value | truncate:maxNumber
 * Example:
 *   {{ "very long string" | truncate:12}}
 *   formats to: very long...
 */
@Pipe({name: 'truncate'})
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxNumber: number): string {
    return truncate(value, maxNumber);
  }
}
