export class LDAPProperties {
  id: number;
  ldapUrl: string;
  domains: string[] = [];
  userDnTemplate: string;
  userSearchBase: string;
  groupSearchBase:string;
  bindDn :string;
  password: string
}
