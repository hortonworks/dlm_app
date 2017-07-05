import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'dp-redirect-url',
  templateUrl: './redirect-url.component.html',
  styleUrls: ['./redirect-url.component.scss']
})
export class RedirectUrlComponent implements OnInit {

  data: any;
  urlToRediect: string;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) {
    activatedRoute.data.subscribe(data => {
      this.data = data;
      this.urlToRediect = this.data.urlToRediect;
      console.log(data);
    });
  }

  ngOnInit() {
    if (this.urlToRediect && this.urlToRediect.length > 0) {
      this.router.navigate([this.urlToRediect], {skipLocationChange: true});
    }
  }
}
