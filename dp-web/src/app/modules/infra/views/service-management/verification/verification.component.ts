import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'dp-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {
  isInvalid = false;
  verificationInProgress = false;
  verified = false;
  smartSenseId: string;

  constructor(private router: Router) { }

  ngOnInit() {

  }

  verifySmartSenseId(){
    this.verificationInProgress = true;
  }

  next(){
    this.router.navigate(['infra', 'services'])
  }

  cancel(){
    this.router.navigate(['infra', 'services'])
  }

}
