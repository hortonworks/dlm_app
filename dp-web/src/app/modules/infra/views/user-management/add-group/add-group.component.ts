import {Component, OnInit} from '@angular/core';
import {LDAPUser} from '../../../../../models/ldap-user';
import {UserService} from '../../../../../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TaggingWidgetTagModel, TagTheme} from '../../../../../shared/tagging-widget/tagging-widget.component';
import {TranslateService} from '@ngx-translate/core';
import {GroupService} from '../../../../../services/group.service';
import {Group} from '../../../../../models/group';

@Component({
  selector: 'dp-add-user',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss']
})
export class AddGroupComponent {//implements OnInit {
  groups: string[] = [];
  roles: TaggingWidgetTagModel[] = [];
  modes = Modes;
  mode = Modes.ADD;
  groupName: string;

  availableGroups: string[] = [];
  availableRoles: TaggingWidgetTagModel[] = [];

  allRoles: TaggingWidgetTagModel[] = [];

  tagTheme = TagTheme;
  group: Group = new Group();
  groupRoles: TaggingWidgetTagModel[] = [];

  constructor(private userService: UserService,
              private groupService: GroupService,
              private router: Router,
              private route: ActivatedRoute,
              private translateService: TranslateService) {
  }

  ngOnInit() {
    this.groupName = this.route.snapshot.params['name'];
    if (this.groupName) {
      this.mode = Modes.EDIT;
      this.groupService.getGroupByName(this.groupName).subscribe(user => {
        this.group = user;
        let roles = [];
        this.group.roles.forEach(role => {
          this.groupRoles.push(new TaggingWidgetTagModel(this.translateService.instant(`common.roles.${role}`), role));
        });
      });
    }
    this.userService.getAllRoles().subscribe(roles => {
      this.allRoles = roles.map(role => {
        return new TaggingWidgetTagModel(this.translateService.instant(`common.roles.${role.roleName}`), role.roleName);
      })
    });
  }

  onNewGroupAddition(text: string) {
    this.groups.push(text);
  }

  onGroupSearchChange(text: string) {
    this.availableGroups = [];
    if (text && text.length > 2) {
      this.userService.searchLDAPGroups(text).subscribe((ldapUsers: LDAPUser[]) => {
        this.availableGroups = [];
        ldapUsers.map(user => {
          this.availableGroups.push(user.name);
        });
      }, () => {
        console.error('Error while fetching ldap users');
      });
    }
  }

  onNewRoleAddition(tag: TaggingWidgetTagModel) {
    this.roles.push(tag);
  }

  onRolesEdit(tag: TaggingWidgetTagModel) {
    this.groupRoles.push(tag);
  }

  onRoleSearchChange(text: string) {
    this.availableRoles = [];
    if (text && text.length > 2) {
      this.availableRoles = this.allRoles.filter(role => {
        return role.display.toLowerCase().startsWith(text.toLowerCase());
      });
    }
  }

  save() {
    if (this.mode as Modes === Modes.EDIT) {
      this.group.roles = this.groupRoles.map(role => {
        return role.data
      });
      this.groupService.updateGroup(this.group).subscribe(user => {
        this.groupService.dataChanged.next();
        this.router.navigate(['groups'], {relativeTo: this.route});
      }, error => {
        console.error('error')
      });
    } else {
      let roles = this.roles.map(role => {
        return role.data;
      });
      this.groupService.addGroups(this.groups, roles).subscribe(response => {
        this.groupService.dataChanged.next();
        this.router.navigate(['groups'], {relativeTo: this.route});
      }, error => {
        console.error('error')
      });
    }
  }

  back() {
    this.router.navigate(['groups'], {relativeTo: this.route});
  }
}

export enum Modes {
  ADD,
  EDIT
}
