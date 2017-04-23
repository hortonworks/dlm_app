import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class PairingService {

  constructor(private http: Http) { }

  createPairing(pairing: any): Observable<any> {
    return this.http.post('pairings', pairing).map(r => r.json());
  }

  fetchPairings(): Observable<any> {
    return this.http.get('pairings').map(r => r.json());
  }

  removePairing(id: string): Observable<any> {
    return this.http.delete(`pairings/${id}`);
  }

}
