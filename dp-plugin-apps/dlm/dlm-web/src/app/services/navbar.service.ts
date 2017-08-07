/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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
