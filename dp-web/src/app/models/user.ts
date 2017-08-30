/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

export class User {

  constructor(public id: string,
              public avatar: string,
              public display: string,
              public token: string,
              public roles: string[],
              public active: boolean,
              public username: string) {
  }

  public services: string[];
}

export class UserList {
  total: number;
  users: User[];
}
