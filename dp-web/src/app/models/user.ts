export class User {
  constructor(
    public id: string,
    public avatar: string,
    public display: string,
    public token: string,
    public roles: string[]
  ) {}
}
