export class LoginData {
    constructor(public name: string, public password: string, public userType: string) {
    }
}

export class User {
    constructor(public username:string,
                public password:string,
                public userType:string,
                public admin:boolean,
                public created:string,
                public enabled:string) {
    }
}

