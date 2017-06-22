import { Component, OnInit } from '@angular/core';
import {LDAPUser} from '../../../../../models/ldap-user';
import {UserService} from '../../../../../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TagTheme} from '../../../../../shared/tagging-widget/tagging-widget.component';
import {IdentityService} from '../../../../../services/identity.service';
import {User} from '../../../../../models/user';

@Component({
  selector: 'dp-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  users: string[] = [];
  roles: string[] = [];
  mode = 'add';
  userName: string;

  availableUsers: string[] = [];
  availableRoles: string[] = [];

  allRoles: string[] = [];

  tagTheme = TagTheme
  user : User = new User('','','','',[], false,'');
  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.userName = this.route.snapshot.params['name'];
    if(this.userName){
      this.mode = 'edit';
      this.userService.getUserByName(this.userName).subscribe(user => this.user = user);
    }
    this.userService.getAllRoles().subscribe(roles => {
      this.allRoles = roles.map(role => {
        return role.roleName;
      })
    });
  }

  onNewUserAddition(text: string) {
    this.users.push(text);
  }

  onUserSearchChange(text: string) {
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
  onNewRoleAddition(text: string) {
    this.roles.push(text);
  }

  onRoleSearchChange(text: string) {
    this.availableRoles = [];
    if(text && text.length > 2){
      this.availableRoles = this.allRoles.filter(role=> {
        return role.toLowerCase().startsWith(text.toLowerCase());
      });
    }
  }

  add(){

  }

  back(){
    this.router.navigate(['/infra/users']);
  }
}
