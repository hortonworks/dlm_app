/**
 * Created by rksv on 05/12/16.
 */
export class Policy {
    id: number;
    name: string;
    status: string;
    auditLogging: string;
    groups: string[];
    users: string[];


    // public static getData(): Policy[] {
    //
    //     let policy1 = new Policy();
    //     policy1.id = 12;
    //     policy1.name = 'All-Databases,table, column';
    //     policy1.status = 'ENABLE';
    //     policy1.auditLogging = 'ENABLE';
    //     policy1.groups = [];
    //     policy1.users = ['HIVE', 'AMBARU-QA'];
    //
    //     data.push(policy1);
    //
    //     // let policy2 = new Policy();
    //     // policy2.id = 15;
    //     // policy2.name = 'All Databases UDF';
    //     // policy2.status = 'ENABLED';
    //     // policy2.auditLogging
    //     // policy2.groups
    //     // policy2.users
    //     //
    //     // data.push(policy2);
    //     //
    //     // let policy3 = new Policy();
    //     // policy3.id = 21;
    //     // policy3.name
    //     // policy3.status
    //     // policy3.auditLogging
    //     // policy3.groups
    //     // policy3.users
    //     //
    //     // data.push(policy3);
    //     //
    //     // let policy4 = new Policy();
    //     // policy4.id = 25;
    //     // policy4.name
    //     // policy4.status
    //     // policy4.auditLogging
    //     // policy4.groups
    //     // policy4.users
    //     //
    //     // data.push(policy4);
    //
    //     return data;
    // }
}