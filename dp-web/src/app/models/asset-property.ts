export class AssetProperty {
  id: string;
  key: string;
  value: string;
}

export class AssetDetails {
  referredEntities: Object;
  entity: {
    classifications : Object[]
  };
}
