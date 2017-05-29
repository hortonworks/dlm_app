import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";
import {RichDatasetModel} from "../models/richDatasetModel";
@Injectable()
export class RichDatasetService {
  url1 = '/api/datasets-by-tag';
  url2 = '/api/datasets-by-id';

  constructor(private http: Http) {
  }

  public listByTag(tagName:string, start:number, limit:number): Observable<any> {
    start -= 1;
    return Observable.create(observer => {
      setTimeout(()=>observer.next(data.slice(start, start + limit)), 300);
    });

  }

  public getById(id:number): Observable<RichDatasetModel> {
    return Observable.create(observer => {
      setTimeout(()=>observer.next(data[id-1]), 300);
    });

  }
}
var data =
[
  {"id":1, "name":"Ssn Data", "description":"Some description of ssn data", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":3, "creatorName":"Rohit C", "favourite":true,counts:{"hiveCount":10, "filesCount":15}}
, {"id":2, "name":"Credit Card1", "description":"Some description of Credit Card", "datalakeId":3, "datalakeName":"SFO_VK24", "creatorId":4, "creatorName":"Hemanth Y", "favourite":false,counts:{"hiveCount":44, "filesCount":5}}
, {"id":3, "name":"Personal", "description":"Some description of Personal", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":5, "creatorName":"Raghu M", "favourite":true,counts:{"hiveCount":86, "filesCount":14}}
, {"id":4, "name":"Classified", "description":"Some description of classified", "datalakeId":4, "datalakeName":"Tax_Gam12", "creatorId":3, "creatorName":"Rohit C", "favourite":true,counts:{"hiveCount":16, "filesCount":23}}
, {"id":5, "name":"Gov_DataShare_Space", "description":"Some description of Gov_DataShare_Space", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":6, "creatorName":"Deep S", "favourite":false,counts:{"hiveCount":69, "filesCount":98}}
, {"id":6, "name":"Financial Dataset", "description":"Some description of Financial Dataset", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":4, "creatorName":"Hemanth Y", "favourite":true,counts:{"hiveCount":79, "filesCount":0}}
, {"id":7, "name":"Working dataset", "description":"Some description of Working dataset", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":5, "creatorName":"Raghu M", "favourite":false,counts:{"hiveCount":88, "filesCount":76}}
, {"id":8, "name":"Perfect", "description":"Some description of Perfect", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":3, "creatorName":"Rohit C", "favourite":false,counts:{"hiveCount":34, "filesCount":38}}
, {"id":9, "name":"Educational", "description":"Some description of Educational", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":6, "creatorName":"Deep S", "favourite":true,counts:{"hiveCount":66, "filesCount":72}}
, {"id":10, "name":"Curated", "description":"Some description of Curated", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":3, "creatorName":"Rohit C", "favourite":false,counts:{"hiveCount":89, "filesCount":63}}
, {"id":11, "name":"Resolved Issues", "description":"Some description of Resolved Issues", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":5, "creatorName":"Raghu M", "favourite":true,counts:{"hiveCount":14, "filesCount":59}}
, {"id":12, "name":"Credit Card2", "description":"Some description of Credit Card", "datalakeId":3, "datalakeName":"SFO_VK24", "creatorId":4, "creatorName":"Hemanth Y", "favourite":false,counts:{"hiveCount":44, "filesCount":5}}
, {"id":13, "name":"Personal", "description":"Some description of Personal", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":5, "creatorName":"Raghu M", "favourite":true,counts:{"hiveCount":86, "filesCount":14}}
, {"id":14, "name":"Classified", "description":"Some description of classified", "datalakeId":4, "datalakeName":"Tax_Gam12", "creatorId":3, "creatorName":"Rohit C", "favourite":true,counts:{"hiveCount":16, "filesCount":23}}
, {"id":15, "name":"Gov_DataShare_Space", "description":"Some description of Gov_DataShare_Space", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":6, "creatorName":"Deep S","favourite":false,counts:{"hiveCount":69, "filesCount":98}}
, {"id":16, "name":"Financial Dataset", "description":"Some description of Financial Dataset", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":4, "creatorName":"Hemanth Y", "favourite":true,counts:{"hiveCount":79, "filesCount":0}}
, {"id":17, "name":"Working dataset", "description":"Some description of Working dataset", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":5, "creatorName":"Raghu M", "favourite":false,counts:{"hiveCount":88, "filesCount":76}}
, {"id":18, "name":"Perfect", "description":"Some description of Perfect", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":3, "creatorName":"Rohit C", "favourite":false,counts:{"hiveCount":34, "filesCount":38}}
, {"id":19, "name":"Educational", "description":"Some description of Educational", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":6, "creatorName":"Deep S", "favourite":true,counts:{"hiveCount":66, "filesCount":72}}
, {"id":20, "name":"Curated", "description":"Some description of Curated", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":3, "creatorName":"Rohit C", "favourite":false,counts:{"hiveCount":89, "filesCount":63}}
, {"id":21, "name":"Resolved Issues", "description":"Some description of Resolved Issues", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":5, "creatorName":"Raghu M", "favourite":true,counts:{"hiveCount":14, "filesCount":59}}
, {"id":22, "name":"Credit Card3", "description":"Some description of Credit Card", "datalakeId":3, "datalakeName":"SFO_VK24", "creatorId":4, "creatorName":"Hemanth Y", "favourite":false,counts:{"hiveCount":44, "filesCount":5}}
, {"id":23, "name":"Personal", "description":"Some description of Personal", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":5, "creatorName":"Raghu M", "favourite":true,counts:{"hiveCount":86, "filesCount":14}}
, {"id":24, "name":"Classified", "description":"Some description of classified", "datalakeId":4, "datalakeName":"Tax_Gam12", "creatorId":3, "creatorName":"Rohit C", "favourite":true,counts:{"hiveCount":16, "filesCount":23}}
, {"id":25, "name":"Gov_DataShare_Space", "description":"Some description of Gov_DataShare_Space", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":6, "creatorName":"Deep S", "favourite":false,counts:{"hiveCount":69, "filesCount":98}}
, {"id":26, "name":"Financial Dataset", "description":"Some description of Financial Dataset", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":4, "creatorName":"Hemanth Y", "favourite":true,counts:{"hiveCount":79, "filesCount":0}}
, {"id":27, "name":"Working dataset", "description":"Some description of Working dataset", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":5, "creatorName":"Raghu M", "favourite":false,counts:{"hiveCount":88, "filesCount":76}}
, {"id":28, "name":"Perfect", "description":"Some description of Perfect", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":3, "creatorName":"Rohit C", "favourite":false,counts:{"hiveCount":34, "filesCount":38}}
, {"id":29, "name":"Educational", "description":"Some description of Educational", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":6, "creatorName":"Deep S", "favourite":true,counts:{"hiveCount":66, "filesCount":72}}
, {"id":30, "name":"Curated", "description":"Some description of Curated", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":3, "creatorName":"Rohit C", "favourite":false,counts:{"hiveCount":89, "filesCount":63}}
, {"id":31, "name":"Resolved Issues", "description":"Some description of Resolved Issues", "datalakeId":2, "datalakeName":"Newyork_2", "creatorId":5, "creatorName":"Raghu M", "favourite":true,counts:{"hiveCount":14, "filesCount":59}}
]
