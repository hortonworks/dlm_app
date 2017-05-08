import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';

/**
 * This file might be moved to common/services/navbar.service.ts
 */
@Injectable()
export class NavbarService {
  isCollapsed = new BehaviorSubject(true);

  toggleNavbar() {
    this.isCollapsed.next(!this.isCollapsed.getValue());
  }
};
