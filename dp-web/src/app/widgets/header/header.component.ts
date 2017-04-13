import { Component, Input } from '@angular/core';

import { User } from '../../models/user';

@Component({
  selector: '[dpHeader]',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input('user')
  user: User;

  constructor() { }

}
