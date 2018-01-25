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
import {RangerService} from '../../../../../services/ranger.service';
import {AssetService} from '../../../../../services/asset.service';

export enum AuditWidgetState {
  NOINFO, LOADING, LOADED
}

@Component({
  selector: 'asset-audit-view',
  templateUrl: './asset-audit-view.component.html',
  styleUrls: ['./asset-audit-view.component.scss']
})
export class AssetAuditView implements OnInit {
  @Input() assetDetails;
  @Input() clusterId: string;
  audits:any[] = [];
  AWS = AuditWidgetState;
  state = this.AWS.NOINFO;
  accessType:string = "ALL";
  result:string = "ALL";
  pageSize:number = 20;
  pageStartsFrom:number = 1;
  count = 3;
  resultOptions:string[] = ["ALL", "ALLOWED", "DENIED"];
  accessTypeOptions:string[] = ["ALL", "SELECT", "UPDATE", "CREATE", "DROP", "ALTER", "INDEX", "READ", "WRITE"];
  showMockVisualization = true;
  dbName:string="";
  assetName:string="";

  constructor(private rangerService: RangerService, private assetService: AssetService) {
  }

  ngOnInit() {
  	console.log(this.assetDetails, this.clusterId);
  	if(!this.assetDetails) return;
  	this.onRefresh();
    // this.assetService.checkMockAuditVisualStatus().subscribe(status => {
    //   console.log(status);
    //   this.showMockVisualization = status.showMockVisualization;
    // });

  }
  onRefresh(){
  	this.audits = [];
  	this.state = this.AWS.LOADING;
  	let qualifiedName = this.assetDetails.entity.attributes.qualifiedName;
  	this.dbName = qualifiedName.slice(0, qualifiedName.indexOf('.'));
  	this.assetName = this.assetDetails.entity.attributes.name;
  	this.rangerService.getAuditDetails(this.clusterId, this.dbName, this.assetName, this.pageStartsFrom-1, this.pageSize, this.accessType, this.result)
  	  .subscribe(details=>{
  	  	this.count = this.rangerService.getTotalCount();
  	  	this.state = this.AWS.LOADED;
  	  	this.audits = details;
  	  },
  	  err => (err.status === 404) && (this.state = this.AWS.NOINFO)
  	  );
  }
  setFirstPage() {
    this.pageStartsFrom = 1;
  }
  onPageSizeChange(size: number) {
    this.setFirstPage();
    this.pageSize = size;
    this.onRefresh();
  }
  onPageChange(index: number) {
    if(this.pageStartsFrom < index && this.audits.length < this.pageSize) {
      this.pageStartsFrom = index;
      setTimeout(()=>this.pageStartsFrom = index-this.pageSize, 0);
      return;
    }
    this.pageStartsFrom = index;
    this.onRefresh();
  }

}