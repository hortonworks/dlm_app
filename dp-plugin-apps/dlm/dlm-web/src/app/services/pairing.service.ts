/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { PairingRequestBody } from 'models/pairing.model';

@Injectable()
export class PairingService {

  constructor(private http: Http) { }

  createPairing(pairing: PairingRequestBody): Observable<any> {
    return this.http.post('pair', pairing).map(r => r.json());
  }

  fetchPairings(): Observable<any> {
    return this.http.get('pairs').map(r => r.json());
  }

  deletePairing(pairing: PairingRequestBody): Observable<any> {
    return this.http.post('unpair', pairing).map(r => r.json());
  }

}
