import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {LDAPProperties} from '../../../../../models/ldap-properties';
import {ConfigurationService} from '../../../../../services/configuration.service';
import {NgForm} from '@angular/forms';
import {Alerts} from '../../../../../shared/utils/alerts';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'dp-ldap-config',
  templateUrl: './ldap-config.component.html',
  styleUrls: ['./ldap-config.component.scss', '../dp-onboard.component.scss']
})
export class LdapConfigComponent implements OnInit {

  showKnoxPassword = false;
  showLdapPassword = false;
  showNotification = false;
  notificationMessages: string[] = [];
  ldapProperties: LDAPProperties = new LDAPProperties();

  @ViewChild('configForm') configForm: NgForm;


  constructor(private configurationService: ConfigurationService,
              private router: Router,
              private route: ActivatedRoute,
              private translateService: TranslateService) {
  }

  ngOnInit() {

  }

  save() {
    this.notificationMessages = [];
    if (!this.configForm.form.valid) {
      this.translateService.get('common.defaultRequiredFields').subscribe(msg => this.notificationMessages.push(msg));
      this.showNotification = true;
      return;
    }
    this.configurationService.configureLDAP(this.ldapProperties).subscribe(() => {
      this.router.navigate(['onboard/adduser', {
        status: 'success'
      }]);
    }, (response) => {
      this.showNotification = true;
      if (!response || !response._body) {
        this.notificationMessages.push('Error occurred while saving the configurations.')
      } else {
        response._body.forEach(error => {
          this.notificationMessages.push(error.message);
        });
      }
    });
  }

  back() {
    this.router.navigate(['onboard/welcome']);
  }

  closeNotification() {
    this.showNotification = false;
  }

}
