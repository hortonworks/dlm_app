import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AddOnAppService} from '../../../../services/add-on-app.service';
import {AddOnAppInfo, EnabledAppInfo} from '../../../../models/add-on-app';

@Component({
  selector: 'dp-service-management',
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.scss']
})
export class ServiceManagementComponent implements OnInit {

  allServices: AddOnAppInfo[] = [];
  availableServices: AddOnAppInfo[] = [];
  enabledServices: EnabledAppInfo[] = [];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private addOnAppService: AddOnAppService) {
  }

  ngOnInit() {
    this.addOnAppService.getAllServices().subscribe((services) => {
      this.allServices = services;
      this.availableServices = this.allServices.filter(service => service.enabled === false);
    });
    this.addOnAppService.getEnabledServices().subscribe((services) => {
      this.enabledServices = services;
    });

  }


  enableService(service: AddOnAppInfo) {
    this.router.navigate(['verify', service.skuName], {relativeTo: this.route})
  }

}
