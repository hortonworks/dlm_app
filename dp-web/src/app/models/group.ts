export class Group {
  public id: string;
  public displayName: string;
  public roles: string[];
  public active: boolean;
  public groupName: string
}

export class GroupList {
  total: number;
  groups: Group[]
}
