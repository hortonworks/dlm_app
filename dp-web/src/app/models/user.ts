export class User {

  constructor(
    public id: string,
    public avatar: string,
    public display: string,
    public token: string,
    public roles: string[],
    public active: boolean,
    public username: string
  ) {}
}

export class UserList {
  total : number;
  users : User[]

}
