/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { capitalize } from 'utils/string-utils';

@Pipe({name: 'statusFmt'})
export class StatusFmtPipe implements PipeTransform {
  transform(status: string): string {
    return {
        'RUNNING': 'Active'
      }[status] || capitalize(status);
  }
}
