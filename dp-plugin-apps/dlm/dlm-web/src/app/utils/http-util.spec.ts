/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import * as httpUtil from './http-util';
import { HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';

describe('HTTP Util', () => {
  describe('#getHeaders', () => {
    it('should return correct headers', () => {
      const headers: HttpHeaders = httpUtil.getHeaders();
      expect(headers.keys()).toEqual(['Content-Type', 'X-Requested-With'], 'two keys present');
      expect(headers.get('Content-Type')).toBe('application/json', 'Content-Type value');
      expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest', 'X-Requested-With value');
    });
  });

  describe('#getError', () => {
    it('should return unknown error if "message" attribute is not present', () => {
      const err = new HttpErrorResponse({
        error: 'Some message'
      });
      expect(httpUtil.getError(err)).toEqual({message: 'common.errors.unknown'});
    });

    it('should parse message from "message" attribute after "Failed with"', () => {
      const err = new HttpErrorResponse({
        error: { message: `Failed with ${JSON.stringify({ message: 'API Error' })}` }
      });
      expect(httpUtil.getError(err)).toEqual({message: 'API Error'});
    });

    it('should parse message from "error.message" attribute after "Failed with"', () => {
      const err = new HttpErrorResponse({
        error: { message: `Failed with ${JSON.stringify({ error : { message: 'API Error' } })}` }
      });
      expect(httpUtil.getError(err)).toEqual({message: 'API Error'});
    });

    it('should return message as is if message cannot be JSON parsed', () => {
      const err = new HttpErrorResponse({
        error: { message: 'Failed' }
      });
      expect(httpUtil.getError(err)).toEqual({message: 'Failed'});
    });
  });
});
