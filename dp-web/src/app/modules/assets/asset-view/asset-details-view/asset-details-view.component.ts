import {Component, OnInit} from '@angular/core';
import {TabStyleType} from '../../../../shared/tabs/tabs.component';
import {AssetService} from '../../../../services/asset.service';
import {AssetProperty} from '../../../../models/asset-property';
import {AssetTag} from '../../../../models/asset-tag';
import {AssetAudit} from '../../../../models/asset-audit';
import {AssetSchema} from '../../../../models/asset-schema';

export enum DetailsTabs {
  PROPERTIES, TAGS, AUDITS, SCHEMA
}

@Component({
  selector: 'dp-asset-details-view',
  templateUrl: './asset-details-view.component.html',
  styleUrls: ['./asset-details-view.component.scss']
})
export class AssetDetailsViewComponent implements OnInit {

  tabType = TabStyleType;
  detailsTabs = DetailsTabs;
  selectedDetailsTabs = DetailsTabs.PROPERTIES;
  assetProperties: AssetProperty[] = [];
  assetTags: AssetTag[] = [];
  assetAudits: AssetAudit[] = [];
  assetSchemas: AssetSchema[] = [];

  constructor(private assetService: AssetService) {
  }

  ngOnInit() {
    this.assetService.getProperties('1989', '1cb2fd1e-03b4-401f-a587-2151865d375a').subscribe(properties => {
      this.assetProperties = this.extractAssetProperties(properties);
      this.assetTags = this.extractTags(properties['classifications']);
    });
    this.assetService.getAudits("12").subscribe(assetAudits =>{
      this.assetAudits = assetAudits;
    });
    this.assetService.getSchemas("12").subscribe(assetSchemas => {
      this.assetSchemas = assetSchemas;
    });
  }

  private extractTags(classifications){
    let assetTags: AssetTag[] = [];
    classifications.forEach(classification =>{
      let tag = new AssetTag();
      tag.name = classification.typeName;
      tag.attributes = classification.attributes? classification.attributes: 'NA';
      assetTags.push(tag);
    });
    return assetTags;
  }

  private extractAssetProperties(properties){
    let assetProps: AssetProperty[] = []
    let attributes = properties.attributes;
    Object.keys(attributes).forEach(key =>{
      if(key === 'columns' || key === 'sd'){
        return;
      }
      let property = new AssetProperty();
      property.key = key;
      property.value = attributes[key];
      if(key === 'profileData'){
        let rowCount = attributes[key].attributes['rowCount'];
        property.value = `Row Count: ${rowCount}`;
      }else if(key === 'db'){
        let dbValues = attributes.qualifiedName.split('.');
        property.value = dbValues[0];
      }
      assetProps.push(property);
    });
    return assetProps;
  }
}
