export const credential = {
  username: 'admin',
  password: 'admin'
};

export const knoxCredential = {
  username: 'admin',
  password: 'admin-password'
};

export const db = {
  path: '../services/db-service/db',
  cmd: 'flyway clean migrate'
};

export const clusterAddData = {
  inValidAmbariUrl: "http:////12.113",
  ambariUrl1: "http://172.27.32.8:8080",  //make sure this IP is valid and NOT already added
  ambariUrl2: "http://172.27.18.11:8080", //make sure this IP is valid and NOT already added
  notReachablrAmbari: "http://172.27.32.9:8080",  // make sure this IP is NOT reachable
  ambariUrlProxy: "https://40.118.130.196/ambari", // make sure this is valid ambari address and is not already added. If knox is installed then please follow pre-addition steps of adding public key.
  dataCenter1: "dc999999990",
  dataCenter2: "dc999999991",
  tagSingle: "tag1",
  tagsArray:["tag1","tag2","tag3","tag4"],
  locationPre: "cala",
  description: "desc1",
  addSuccessUrl: "/infra/clusters",
  inValidAmbariMsg: "Invalid Ambari URL. Please enter a valid URL of the form http[s]://hostname[:port][/path].",
  ambariNetworkError: "There was a network error when connecting to Ambari.",
  fillAllMandatoryFieldsMsg: "Please fill in mandatory fields marked with '*'",
  addSuccessMsg: "Your cluster has been added to DataPlane.",
  alreadyExistsmsg: "Cluster already exists in DataPlane"
};

export const lakeList = {
  ambariUrl1: "http://172.27.18.11:8080",  //this should be IP (not host name) and make sure this IP is valid
  ambariUrl2: "http://172.27.32.8:8080" //this should be IP (not host name) and make sure this IP is valid
};

export const ldapConfig = {
  uri: 'ldap://knox:33389',

  admin_bind_dn: 'uid=admin,ou=people,dc=hadoop,dc=apache,dc=org',
  admin_password: 'admin-password',

  user_search_base: 'ou=people,dc=hadoop,dc=apache,dc=org',
  user_search_attr: 'uid',
  group_search_base: 'ou=groups,dc=hadoop,dc=apache,dc=org',
  group_search_attr: 'cn',
  group_object_class: 'groupofnames',
  group_member_attr: 'member',
};
