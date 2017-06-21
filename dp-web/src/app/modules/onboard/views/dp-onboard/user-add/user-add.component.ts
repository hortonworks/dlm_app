import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../../../services/user.service';
import {LDAPUser} from '../../../../../models/ldap-user';

@Component({
  selector: 'dp-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss', '../dp-onboard.component.scss']
})
export class UserAddComponent implements OnInit {

  showNotification = false;
  tags: string[] = [];
  availableUsers: string[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {
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

  }

  back() {
    this.router.navigate(['/onboard/configure']);
  }

  onNewUserAddition(text: string) {
    this.tags.push(text);
  }

  onTagSearchChange(text: string) {
    this.availableUsers = [];
    if(text && text.length > 2){
      this.userService.searchLDAPUsers(text).subscribe((ldapUsers: LDAPUser[])=>{
        this.availableUsers = [];
        ldapUsers.map(user =>{
          this.availableUsers.push(user.name);
        });
      }, ()=>{
        console.error("Error while fetching ldap users");
      });
    }
  }

}
