import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

export interface RedirectUrlData {
  urlToRediect?: string;
  find?: string;
  replace?: string;
}

@Component({
  selector: 'dp-redirect-url',
  templateUrl: './redirect-url.component.html'
})

export class RedirectUrlComponent implements OnInit {

  data: RedirectUrlData;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) {
    activatedRoute.data.subscribe(data => {
      this.data = data;
    });
  }

  ngOnInit() {
    let newURL = '';

    let urlToRediect = this.data.urlToRediect;
    if (urlToRediect && urlToRediect.length > 0) {
      newURL = urlToRediect;
    }

    let find = this.data.find;
    if (find && find.length > 0) {
      let replace = this.data.replace;
      let path = this.router.routerState.snapshot.url;
      newURL = path.replace(new RegExp(find), replace);
    }

    this.router.navigate([newURL], {skipLocationChange: true});
  }
}
