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

import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ServiceErrorType} from "../utils/enums";

@Component({
  selector: 'dp-service-error',
  templateUrl: './service-error.component.html',
  styleUrls: ['./service-error.component.scss']
})
export class ServiceErrorComponent implements OnInit {

  errorTypeRef = ServiceErrorType;
  errorType: any;
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.errorType = this.route.snapshot.params['type'];
    console.log(this.errorType)
  }

}
