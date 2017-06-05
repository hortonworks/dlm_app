import {User} from './user';
export class AssetSchema {
  policyName: string;
  user: User;
  group: string;
  permissions: string;
  accessType: string;
  delegateAdmin: string;

  public static getAssetSchema(): AssetSchema[]{
    let assetSchemas:AssetSchema[] = [];
    for(let i=0;i<10;i++){
      let schema: AssetSchema = new AssetSchema();
      let user = new User(`user-${i}`, "", `user-${i}`, "", []);
      schema.policyName  = `name-${i}`;
      schema.user = user;
      schema.group = 'admin';
      schema.permissions = 'RW';
      schema.accessType = `Access-${i}`;
      schema.delegateAdmin = 'super admin';
      assetSchemas.push(schema);
    }
    return assetSchemas;
  }
}
