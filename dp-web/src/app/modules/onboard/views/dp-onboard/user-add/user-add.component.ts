import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../../../services/user.service';
import {LDAPUser} from '../../../../../models/ldap-user';
import {TagTheme} from '../../../../../shared/tagging-widget/tagging-widget.component';
import {AuthenticationService} from '../../../../../services/authentication.service';

@Component({
  selector: 'dp-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss', '../dp-onboard.component.scss']
})
export class UserAddComponent implements OnInit {

  showNotification = false;
  users: string[] = [];
  availableUsers: string[] = [];
  tagThemes = TagTheme;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.status && params.status === 'success') {
        this.showNotification = true;
      }
    });
  }

  closeNotification() {
    this.showNotification = false;
  }

  save() {
    this.userService.addAdminUsers(this.users).subscribe(response => {
      this.authenticationService.signOut();
    }, (error) => {
      console.error(error)
    });
  }

  back() {
    this.router.navigate(['/onboard/configure']);
  }

  onNewUserAddition(text: string) {
    this.users.push(text);
  }

  onTagSearchChange(text: string) {
    this.availableUsers = [];
    if (text && text.length > 2) {
      this.userService.searchLDAPUsers(text).subscribe((ldapUsers: LDAPUser[]) => {
        this.availableUsers = [];
        ldapUsers.map(user => {
          this.availableUsers.push(user.name);
        });
      }, () => {
        console.error('Error while fetching ldap users');
      });
    }
  }

}
