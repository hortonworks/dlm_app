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

import {Directive} from "@angular/core";
import {AbstractControl, NG_ASYNC_VALIDATORS, AsyncValidator} from '@angular/forms';

import {DataSetService} from "../../../services/dataset.service";

@Directive({
  selector: '[dpUniqueDatasetName]',
  providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: UniqueDatasetNameValidator, multi: true }]
})
export class UniqueDatasetNameValidator implements AsyncValidator {
  constructor(private datasetService: DataSetService) {}
  validate(control: AbstractControl) {
    return this.datasetService
      .query({name: control.value})
      .map(datasets => ({'unique': datasets.length !== 0}))
      .debounceTime(500)
      .distinctUntilChanged();
  }
}
