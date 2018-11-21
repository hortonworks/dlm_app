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

import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import * as formUtils from './form-util';

describe('Form Utils', () => {
  describe('#markAllTouched', () => {
    it('should mark all controls as touched', () => {
      const builder = new FormBuilder();
      const form: FormGroup = builder.group({
        sectionOne: builder.group({
          fieldOne: ['']
        }),
        sectionTwo: builder.group({
          subSectionTwoOne: builder.group({
            fieldOne: ['']
          })
        })
      });
      expect(form.touched).toBeFalsy('initialy form is untouched');
      formUtils.markAllTouched(form);
      expect(form.touched).toBeTruthy('form touched');
      expect(form.get('sectionOne').touched).toBeTruthy('section is touched');
      expect(form.get('sectionOne.fieldOne').touched).toBeTruthy('section\'s field is touched');
      expect(form.get('sectionTwo.subSectionTwoOne').touched).toBeTruthy('nested section is touched');
      expect(form.get('sectionTwo.subSectionTwoOne.fieldOne').touched).toBeTruthy('nested section\'s field is touched');
    });

    it('should not throw error when there is no controls', () => {
      const builder = new FormBuilder();
      const form: FormGroup = builder.group({});
      expect(() => formUtils.markAllTouched(form)).not.toThrow();
    });
  });

  describe('#hiveDBNameValidator', () => {
    let validator;
    beforeEach(() => {
      validator = formUtils.hiveDBNameValidator();
    });

    it('should return error when db name is not valid', () => {
      let control = { value: 'contain space' } as AbstractControl;
      const err = { invalidName: true };
      expect(validator(control)).toEqual(err, 'should not contain spaces');
      control = { value: 'invalid_char!' } as AbstractControl;
      expect(validator(control)).toEqual(err, '"!" is not allowed');
      control = { value: 'invalid-char' } as AbstractControl;
      expect(validator(control)).toEqual(err, '"-" is not allowed');
      control = { value: '`invalid' } as AbstractControl;
      expect(validator(control)).toEqual(err, 'opened "`" is not allowed');
    });

    it('should return null when db name is valid', () => {
      let control = { value: 'valid_Name1' } as AbstractControl;
      expect(validator(control)).toBeNull();
      control = { value: '`valid_Name1`' } as AbstractControl;
      expect(validator(control)).toBeNull('should skip surrounded "`"');
    });
  });
});
