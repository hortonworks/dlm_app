import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {AddOnAppService} from '../../../../../services/add-on-app.service';
import {ConfigPayload, SKU} from '../../../../../models/add-on-app';

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
  skuName: string;
  showError = false;
  errorMessage: string;

  constructor(private router: Router,
              private translateService: TranslateService,
              private route: ActivatedRoute,
              private addOnAppService: AddOnAppService) {
  }

  ngOnInit() {
    let serviceName = this.route.snapshot.params['name'];
    this.addOnAppService.getServiceByName(serviceName).subscribe(sku => {
      this.welcomeMessage = this.translateService.instant('pages.services.description.verificationWelcome', {serviceName: sku.description});
    });
    this.skuName = serviceName;
  }

  verifySmartSenseId() {
    this.verificationInProgress = true;
    this.addOnAppService.verify(this.smartSenseId).subscribe(response => {
      this.verificationInProgress = false;
      if (response.isValid) {
        this.verified = true;
      }
      this.isInvalid = !response.isValid;
    }, (error) => {
      this.verificationInProgress = false;
      this.isInvalid = false;
    });
  }

  next() {
    this.addOnAppService.enableService({smartSenseId: this.smartSenseId, skuName: this.skuName} as ConfigPayload).subscribe(() => {
      this.router.navigate(['infra', 'services'])
    }, (error) => {
      this.showError = true;
      this.errorMessage = this.translateService.instant('pages.services.description.enableError');
      console.log(error);
    });
  }

  cancel() {
    this.router.navigate(['infra', 'services'])
  }

}
