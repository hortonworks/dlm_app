/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { FormGroup, FormControl, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const markAllTouched = (form: FormGroup): void => {
  if (!form.controls) {
    return;
  }
  Object.keys(form.controls).forEach(controlName => {
    const control = form.controls[controlName];
    control.markAsTouched({ onlySelf: false });
    markAllTouched(<FormGroup>control);
  });
};

export function uniqValidator(values): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    const {value} = control;
    if (!value) {
      return null;
    }
    return values.includes(value) ? {uniqValidator: {name: value}} : null;
  };
}
