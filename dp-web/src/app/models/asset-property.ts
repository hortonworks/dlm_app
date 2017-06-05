export class AssetProperty {
  id: string;
  key: string;
  value: string;

  public static propertiesList(){
    return Array('clusterName', 'description', 'location', 'name', 'owner', 'ownerType', 'parameters', 'qualifiedName')
  }

  public static getProperties(): AssetProperty[] {

    let assetProperties: AssetProperty[] = [];
    let properties  = AssetProperty.propertiesList();
    for (let i = 0; i < properties.length; i++) {
      let property: AssetProperty = new AssetProperty();
      property.id = i.toString();
      property.key = properties[i];
      property.value = `Value-${i}`;
      assetProperties.push(property);
    }
    return assetProperties;
  }
}
