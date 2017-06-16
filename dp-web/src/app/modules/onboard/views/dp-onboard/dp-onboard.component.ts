import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'dp-dp-onboard',
  templateUrl: './dp-onboard.component.html',
  styleUrls: ['./dp-onboard.component.scss']
})
export class DpOnboardComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  start(){
    this.router.navigate(['/onboard/configure'])
  }

}
