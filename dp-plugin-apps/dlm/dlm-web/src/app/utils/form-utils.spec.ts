/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { FormGroup, FormBuilder } from '@angular/forms';
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
});
