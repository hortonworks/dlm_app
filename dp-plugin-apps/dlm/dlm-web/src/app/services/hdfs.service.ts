import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class HdfsService {

  constructor(private http: Http) {}

  getFilesList(clusterId, path): Observable<any> {
    return this.http.get(`clusters/${clusterId}/webhdfs/file?path=${path}&operation=LISTSTATUS`).map(r => r.json());
  }

}
