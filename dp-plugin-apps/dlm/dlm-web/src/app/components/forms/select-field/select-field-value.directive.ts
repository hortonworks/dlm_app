/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[selectFieldValue]'
})
export class SelectFieldValueDirective {
  constructor(public template: TemplateRef<any>) {}
}
