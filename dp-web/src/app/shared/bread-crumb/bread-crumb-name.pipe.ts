/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'breadCrumbName'})
export class BreadCrumbNamePipe implements PipeTransform {
  static transforms = {
    datasteward: 'Data Steward',
    infra: 'Admin'
  };

  transform(name: string): string {
    if (BreadCrumbNamePipe.transforms[name]) {
      name = BreadCrumbNamePipe.transforms[name];
    }

    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name;
  }
}
