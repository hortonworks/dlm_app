/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const invokeRecursive = (form: FormGroup, methodName, ...args) => {
  if (!form.controls) {
    return;
  }
  Object.keys(form.controls).forEach(controlName => {
    const control = form.get(controlName);
    control[methodName].apply(control, args || []);
    invokeRecursive(control as FormGroup, methodName, args);
  });
};

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

export const markAllPristine = (form: FormGroup): void => {
  invokeRecursive(form, 'markAsPristine', { onlySelf: false });
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

export function jsonValidator(neededKeys = []): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    const {value} = control;
    if (!value) {
      return {jsonValidator: {name: value}};
    }
    let content = '';
    if (typeof value === 'string') {
      try {
        content = JSON.parse(value);
      } catch (e) {
        return {jsonValidator: {name: value}};
      }
    } else {
      content = value;
    }
    if (!neededKeys.length) {
      return null;
    }
    return neededKeys.reduce((r, key) => !!content[key] ? r : true, false) ?  {jsonValidator: {name: value}} : null;
  };
}

export function hiveDBNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    let value: string = control.value;
    if (!value) {
      return null;
    }
    const pattern = /^[a-zA-Z0-9_]*$/;
    if (value.startsWith('`') && value.endsWith('`')) {
      value = value.substring(1, value.length - 1);
    }
    return pattern.test(value) ? null : { invalidName: true };
  };
}

export function singleLineValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    const {value} = control;
    if (!value) {
      return null;
    }
    if (value.includes('\n')) {
      return {'singleLineValidator': {name: value}};
    }
    return null;
  };
}
