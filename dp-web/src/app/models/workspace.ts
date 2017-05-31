export class Workspace {
  name: string;
  source: string;
  owner: string;
  users: number;
  tables: number;
  notebooks: number;
  jobs: number;


  constructor(name:string, source:string, owner:string, users:number, tables:number, notebooks:number, jobs:number) {
    this.name = name;
    this.source = source;
    this.owner = owner;
    this.users = users;
    this.tables = tables;
    this.notebooks = notebooks;
    this.jobs = jobs;
  }

  static getData(): Workspace[] {
    return  [
        new Workspace('WORKSPACE1', 'Datalake_Sfo','Rohit', 1, 1, 4, 2),
        new Workspace('SALESDATA_ANALYSIS', 'Datalake_Sfo','You', 4, 12, 80, 14),
        new Workspace('WORKSPACE003', 'Datalake_Sfo','You', 0, 1, 4, 2),
        new Workspace('WORKSPACE004', 'Datalake_Sfo','Rajeshbabu', 2, 2, 2, 2),
        new Workspace('2017_GEO_IMPACT_ANALYSIS', 'Datalake_Sfo','Rohit', 1, 1, 4, 2)
    ];
  }
}