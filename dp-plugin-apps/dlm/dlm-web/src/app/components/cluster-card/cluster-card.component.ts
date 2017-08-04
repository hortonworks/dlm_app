/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dlm-cluster-card',
  templateUrl: './cluster-card.component.html',
  styleUrls: ['./cluster-card.component.scss']
})
export class ClusterCardComponent implements OnInit {

  @Input() isSelected = false;
  @Input() isDisabled = false;
  constructor() { }

  ngOnInit() {
  }

}
