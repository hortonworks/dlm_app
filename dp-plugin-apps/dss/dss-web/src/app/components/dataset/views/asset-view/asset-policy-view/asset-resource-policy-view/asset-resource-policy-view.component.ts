import {Component, Input} from '@angular/core';
import {AssetPolicyView} from "../asset-policy-view.component";
import {RangerService} from "../../../../../../services/ranger.service";

@Component({
  selector: 'dp-asset-resource-policy-view',
  templateUrl: '../asset-policy-view.component.html',
  styleUrls: ['../asset-policy-view.component.scss']
})
export class AssetResourcePolicyViewComponent extends AssetPolicyView {
  @Input() assetDetails;

  constructor(private rangerService: RangerService) {
    super();
  }

  ngOnInit(){
    super.ngOnInit();
    if(!this.assetDetails) return;
    this.onReload();
  }

  onReload(){
    super.onReload();
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

}
