export class AssetProperty {
  constructor(public key: string, public value?: string) {
  }
}

export class AssetDetails {
  referredEntities: any;
  entity: {
    classifications: any[]
    id: string;
    typeName: string;
    status: string;
  };
}
