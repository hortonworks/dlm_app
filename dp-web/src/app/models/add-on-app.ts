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


