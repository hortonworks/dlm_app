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

export class AddOnAppInfo {
  enabled: boolean;
  sku: SKU;
  skuName: string;
}

export class EnabledAppInfo {
  enabled: boolean;
  enabledSku: EnabledSKU;
  sku: SKU;
  skuName: string;
}

export class SKU {
  created: string;
  description: string;
  id: number;
  name: string;
  status: boolean;
  updated: string;
}

export class EnabledSKU {
  created: string;
  enabledBy: number;
  enabledOn: string;
  skuId: number;
  smartSenseId: string;
  subscriptionId: string;
  updated: string;
}

export class ConfigPayload {
  skuName: string;
  smartSenseId: string;
}

export class AppDependency {
  skuName: string;
  mandatoryDependencies: string[] = [];
  optionalDependencies: string[] = [];
}


