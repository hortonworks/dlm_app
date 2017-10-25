/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

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

  url: string;
  data: RedirectUrlData;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) {
    activatedRoute.data.subscribe(data => {
      this.data = data;
    });
  }

  ngOnInit() {
    this.url = this.router.routerState.snapshot.url;

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
