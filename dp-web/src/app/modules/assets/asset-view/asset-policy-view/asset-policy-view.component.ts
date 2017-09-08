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

import {Component, Input, OnInit} from '@angular/core';
import {RangerService} from '../../../../services/ranger.service';

export enum PolicyWidgetState {
  NOINFO, LOADING, LOADED
}

@Component({
  selector: 'asset-policy-view',
  templateUrl: './asset-policy-view.component.html',
  styleUrls: ['./asset-policy-view.component.scss']
})
export class AssetPolicyView implements OnInit {
  @Input() assetDetails;
  @Input() clusterId: string;
  policies:any[] = [];
  PWS = PolicyWidgetState;
  state = this.PWS.NOINFO;
  pageSize:number = 20;
  pageStartsFrom:number = 1;
  count:number = 0;

  constructor(private rangerService: RangerService) {
  }

  ngOnInit() {
  	if(!this.assetDetails) return;
  	this.onReload();
  }
  onReload(){
  	this.policies = [];
  	this.state = this.PWS.LOADING;
  	let qualifiedName = this.assetDetails.entity.attributes.qualifiedName;
  	let dbName = qualifiedName.slice(0, qualifiedName.indexOf('.'));
  	let name = this.assetDetails.entity.attributes.name;
  	this.rangerService.getPolicyDetails(this.clusterId, dbName, name, this.pageStartsFrom-1, this.pageSize)
  	  .subscribe(details=>{
  	  	this.count = this.rangerService.getTotalPolicyCount();
  	  	this.state = this.PWS.LOADED;
  	  	this.policies = details;
  	  },
  	  err => (err.status === 404) && (this.state = this.PWS.NOINFO)
  	  );
  }
  setFirstPage() {
    this.pageStartsFrom = 1;
  }
  onPageSizeChange(size: number) {
    this.setFirstPage();
    this.pageSize = size;
    this.onReload();
  }
  onPageChange(index: number) {
    if(this.pageStartsFrom < index && this.policies.length < this.pageSize) {
      this.pageStartsFrom = index;
      setTimeout(()=>this.pageStartsFrom = index-this.pageSize, 0);
      return;
    }
    this.pageStartsFrom = index;
    this.onReload();
  }
}
