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

import {Component, Input} from '@angular/core';
import {RangerService} from '../../../../../services/ranger.service';
import {AssetPolicyView, PolicyWidgetState} from "../asset-policy-view.component";

@Component({
  selector: 'dp-asset-tag-policy-view',
  templateUrl: '../asset-policy-view.component.html',
  styleUrls: ['../asset-policy-view.component.scss']
})
export class AssetTagPolicyViewComponent extends AssetPolicyView  {
  @Input() guid: string;

  constructor(private rangerService: RangerService) {
    super();
  }

  ngOnInit(){
    super.ngOnInit();
    if(!this.clusterId || !this.guid) return;
    this.showPagination = false;
    this.isTagBasedPolicy = true;
    this.onReload();
  }

  onReload(){
    super.onReload();
    this.rangerService.getTagPolicyDetails(this.clusterId, this.guid, this.pageStartsFrom-1, this.pageSize)
      .subscribe(details=>{
          this.state = this.PWS.LOADED;
          this.policies = details;
        },
        err => (err.status === 404) && (this.state = this.PWS.NOINFO)
      );
  }

}
