import {Component, Input, OnInit} from '@angular/core';
import {RangerService} from '../../../../services/ranger.service';

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

  constructor(private rangerService: RangerService) {
  }

  ngOnInit() {
  	console.log(this.assetDetails, this.clusterId);
  	if(!this.assetDetails) return;
  	this.audits = [];
  	this.state = this.AWS.LOADING;
  	let qualifiedName = this.assetDetails.entity.attributes.qualifiedName;
  	let dbName = qualifiedName.slice(0, qualifiedName.indexOf('.'));
  	let name = this.assetDetails.entity.attributes.name;
  	this.rangerService.getAuditDetails(this.clusterId, dbName, name, 0, 20)
  	  .subscribe(details=>{
  	  	this.state = this.AWS.LOADED;
  	  	this.audits = details.vXAccessAudits;
  	  });

  }

}