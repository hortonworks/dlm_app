import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class PairingService {

  constructor(private http: Http) { }

  createPairing(pairing: any): Observable<any> {
    // Expected structure:
    // [
    //   {
    //     clusterId: 1,
    //     beaconUrl: “http//:hostname1:port”
    //   },
    //   {
    //     clusterId: 2,
    //     beaconUrl: “http//:hostname2:port”
    //   }
    // ]
    return this.http.post('pairings', pairing).map(r => r.json());
  }

  fetchPairings(): Observable<any> {
    return this.http.get('pairings').map(r => r.json());
  }

  deletePairing(pairingId: string): Observable<any> {
    return this.http.delete(`pairings/${pairingId}`).map(r => r.json());
  }

}
