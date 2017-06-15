import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {LDAPProperties} from '../../../../../models/ldap-properties';
import {ConfigurationService} from '../../../../../services/configuration.service';

@Component({
  selector: 'dp-ldap-config',
  templateUrl: './ldap-config.component.html',
  styleUrls: ['./ldap-config.component.scss', '../dp-onboard.component.scss']
})
export class LdapConfigComponent implements OnInit {

  showKnoxPassword = false;
  showLdapPassword = false;
  ldapProperties: LDAPProperties = new LDAPProperties();


  constructor(private configurationService: ConfigurationService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {

  }

  save() {
    this.configurationService.configureLDAP(this.ldapProperties).subscribe(() => {
      this.router.navigate(['onboard/adduser', {
        status: 'success'
      }]);
    }, () => {
      console.log('error');
    });
  }

  back() {
    this.router.navigate(['onboard']);
  }

}
