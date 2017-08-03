import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'dp-service-management',
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.scss']
})
export class ServiceManagementComponent implements OnInit {

  services = [];
  enabledServices = [];

  constructor(private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.services = [
      {name: 'Data Lifecycle Manager', imageName: 'dlm-logo.png'},
      {name: 'Data Steward Studio', imageName: 'steward-logo.png'}
    ]
    this.enabledServices = [
      {name: 'Data Lifecycle Manager', imageName: 'dlm-logo.png'},
      {name: 'Data Steward Studio', imageName: 'steward-logo.png'}
    ]
  }

  enableService(service) {
    this.router.navigate(['verify', '1'], {relativeTo: this.route})
  }

}
