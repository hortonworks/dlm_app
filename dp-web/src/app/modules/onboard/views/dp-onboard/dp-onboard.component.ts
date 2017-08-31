/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'dp-dp-onboard',
  templateUrl: './dp-onboard.component.html',
  styleUrls: ['./dp-onboard.component.scss']
})
export class DpOnboardComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  start() {
    this.router.navigate(['/onboard/configure']);
  }

}
