export class AssetProperty {
  constructor(public key: string, public value?: string) {
  }
}

export class AssetDetails {
  referredEntities: Object;
  entity: {
    classifications: Object[]
  };
}
