import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

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
  welcomeMessage: string;

  constructor(private router: Router,
              private translateService: TranslateService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    let serviceName = this.route.snapshot.params['name'];
    this.welcomeMessage = this.translateService.instant('pages.services.description.verificationWelcome', {serviceName: serviceName});
  }

  verifySmartSenseId() {
    this.verificationInProgress = true;
  }

  next() {
    this.router.navigate(['infra', 'services'])
  }

  cancel() {
    this.router.navigate(['infra', 'services'])
  }

}
