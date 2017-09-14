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

export enum PolicyWidgetState {
  NOINFO, LOADING, LOADED
}

@Component({
  selector: 'asset-policy-view',
  templateUrl: './asset-policy-view.component.html',
  styleUrls: ['./asset-policy-view.component.scss']
})
export class AssetPolicyView implements OnInit {
  @Input() clusterId: string;
  policies:any[] = [];
  PWS = PolicyWidgetState;
  state = this.PWS.NOINFO;
  pageSize:number = 20;
  pageStartsFrom:number = 1;
  count:number = 0;
  showPagination: boolean = true;


  ngOnInit() {}

  onReload(){
    this.policies = [];
    this.state = this.PWS.LOADING;
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
