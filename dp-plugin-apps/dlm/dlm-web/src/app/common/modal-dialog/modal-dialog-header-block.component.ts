/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dlm-modal-dialog-header-block',
  template: '<ng-content></ng-content>'
})

export class ModalDialogHeaderBlockComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}