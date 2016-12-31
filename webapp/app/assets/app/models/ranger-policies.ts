export class RangerPolicies {
    access: string;
    enforcer: string;
    repo: string;
    reqUser: string;
    resource: string;
    resType: string;
    action: string;
    time: Date;


    public static getData(json: Object): RangerPolicies[] {
        let docs = json['response']['docs'];
        let policies = docs.map(doc => {
            let policy = new RangerPolicies();
            policy.access = doc['access'];
            policy.reqUser = doc['reqUser'];
            policy.enforcer = doc['enforcer'];
            policy.repo = doc['repo'];
            policy.resource = doc['resource'];
            policy.resType = doc['resType'];
            policy.action = doc['action'];
            policy.time = new Date(doc['evtTime']);
            return policy;
        });

        return policies;
    }
}