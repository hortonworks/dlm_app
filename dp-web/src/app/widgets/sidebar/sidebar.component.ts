import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'dp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService) { }

  isLoggedIn() {
    this.authenticationService.isAuthenticated();
  }

  ngOnInit() { }

}
