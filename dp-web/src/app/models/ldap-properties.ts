export class LDAPProperties {
  id: number;
  ldapUrl: string;
  domains: string[] = [];
  userSearchBase: string;
  userSearchAttributeName: string;
  groupSearchBase:string;
  groupSearchAttributeName: String;
  bindDn :string;
  password: string;
  groupObjectClass: string;
  groupMemberAttributeName: string;

}
