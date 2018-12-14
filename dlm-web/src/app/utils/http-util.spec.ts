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

import * as httpUtil from './http-util';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';

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
      expect(httpUtil.getError(err)).toEqual({message: 'Something went wrong.'});
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

    it('should parse message from "errors.error[0].message" attribute after "Failed with"', () => {
      const err = new HttpErrorResponse({
        error: { message: `Failed with ${JSON.stringify({errors: [{ error : { message: 'API Error' } }]})}` }
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

  describe('#toSearchParams', () => {
    it('should return HttpParams from object', () => {
      const queryParams = { number: 1, string: 'str', object: { param: 'value' } };
      const params = httpUtil.toSearchParams(queryParams);
      expect(params.get('number')).toBe('1', 'number converted to string');
      expect(params.get('string')).toBe('str', 'string is still string');
      expect(params.get('object')).toBe(JSON.stringify(queryParams.object), 'object is stringified');
      expect(params.keys()).toEqual(['number', 'string', 'object'], 'all keys present');
    });
  });
});
