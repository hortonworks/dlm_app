export class RangerPolicies {
    id: number;
    name: string;
    status: string;
    auditLogging: string;
    groups: string[];
    users: string[];


    public static getData(): RangerPolicies[] {
        let data:RangerPolicies[] = [];

        let policy1 = new RangerPolicies();
        policy1.id = 12;
        policy1.name = 'All-Databases,table, column';
        policy1.status = 'ENABLE';
        policy1.auditLogging = 'ENABLE';
        policy1.groups = [];
        policy1.users = ['HIVE', 'AMBARU-QA'];

        data.push(policy1);

        let policy2 = new RangerPolicies();
        policy2.id = 15;
        policy2.name = 'All Databases UDF';
        policy2.status = 'ENABLE';
        policy2.auditLogging = 'DISABLE';
        policy2.groups = ['Public'];
        policy2.users = [];

        data.push(policy2);

        let policy3 = new RangerPolicies();
        policy3.id = 21;
        policy3.name = 'HIVE Global Tables Allow';
        policy3.status = 'ENABLE';
        policy3.auditLogging = 'ENABLE';
        policy3.groups = ['IT', 'PUBLIC'];
        policy3.users = [];

        data.push(policy3);

        let policy4 = new RangerPolicies();
        policy4.id = 25;
        policy4.name = 'Call-Details-Table';
        policy4.status = 'DISABLE';
        policy4.auditLogging = 'ENABLE';
        policy4.groups = [];
        policy4.users = ['Raj_ops', 'Holger_Gov', 'amy-ds'];

        data.push(policy4);

        return data;
    }
}