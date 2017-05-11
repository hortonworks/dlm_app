import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs";

@Injectable()
export class DsTagsService {
  url1 = '/api/tags'

  constructor(private http: Http) {
  }
  public list(searchText:string, size:number): Observable<string[]> {
    //console.log("DsAssetService List", dsId, pageNo, pageSize);
    return Observable.create(observer => {
      setTimeout(()=>observer.next(data.filter(str=>searchText && str.toLowerCase().indexOf(searchText.toLowerCase()) != -1).slice(0,size)), 300);
    });
  }
  public listDatasetTags(dsId:number) : Observable<string[]> {
    return Observable.create(observer => {
      setTimeout(()=>observer.next((dsId)?data.slice(dsId,1+dsId):[]), 30);
    });
  }

}
var data = [
  "TAG-1",
  "TAG-2",
  "AAA",
  "AAB",
  "ABC",
  "Juno",
  "Deep",
  "Red",
  "Dark",
  "American",
  "India",
  "UK",
  "Shrek",
  "Ronin",
  "Christmas",
  "Candidate",
  "Seconds",
  "Smoke",
  "Truth",
  "Ugly",
  "Chariots",
  "Back to the Future","Desperado","Night at the Museum","Robocop","Ghostbusters","Cool World","Donnie Darko","Double Indemnity","The Spanish Prisoner","The Smurfs","Dead Alive","Army of Darkness","Peter Pan","The Jungle Story","Red Planet","Deep Impact","The Long Kiss Goodnight","Juno","(500) Days of Summer","The Dark Knight","Bringing Down the House","Se7en","Chocolat","The American","The American President","Hudsucker Proxy","Conan the Barbarian","Shrek","The Fox and the Hound","Lock, Stock, and Two Barrels","Date Night","200 Cigarettes","9 1/2 Weeks","Iron Man 2","Tombstone","Young Guns","Fight Club","The Cell","The Unborn","Black Christmas","The Change-Up","The Last of the Mohicans","Shutter Island","Ronin","Ocean&#8217;s 11","Philadelphia","Chariots of Fire","M*A*S*H","Walking and Talking","Walking Tall","The 40 Year Old Virgin","Superman III","The Hour","The Slums of Beverly Hills","Secretary","Secretariat","Pretty Woman","Sleepless in Seattle","The Iron Mask","Smoke","Schindler&#8217;s List","The Beverly Hillbillies","The Ugly Truth","Bounty Hunter","Say Anything","8 Seconds","Metropolis","Indiana Jones and the Temple of Doom","Kramer vs. Kramer","The Manchurian Candidate","Raging Bull","Heat","About Schmidt","Re-Animator","Evolution","Gone in 60 Seconds","Wanted","The Man with One Red Shoe","The Jerk","Whip It","Spanking the Monkey","Steel Magnolias","Horton Hears a Who","Honey","Brazil","Gorillas in the Mist","Before Sunset","After Dark","From Dusk til Dawn","Cloudy with a Chance of Meatballs","Harvey","Mr. Smith Goes to Washington","L.A. Confidential","Little Miss Sunshine","The Future","Howard the Duck","Howard&#8217;s End","The Innkeeper"," Revolutionary Road"
]





