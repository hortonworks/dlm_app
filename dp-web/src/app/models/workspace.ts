export class Workspace {
  id: number;
  name: string;
  description: string;
  source: number;
  createdBy: string;


  // constructor(name?: string, source?: number, owner?: string, users?: number, tables?: number, notebooks?: number, jobs?: number) {
  //   this.name = name;
  //   this.source = source;
  //   this.createdBy = owner;
  //   this.users = users;
  //   this.tables = tables;
  //   this.notebooks = notebooks;
  //   this.jobs = jobs;
  // }
  //
  // static getData(): Workspace[] {
  //   return  [
  //       new Workspace('WORKSPACE1', 1,'Rohit', 1, 1, 4, 2),
  //       new Workspace('SALESDATA_ANALYSIS', 2,'You', 4, 12, 80, 14),
  //       new Workspace('WORKSPACE003', 1,'You', 0, 1, 4, 2),
  //       new Workspace('WORKSPACE004', 1,'Rajeshbabu', 2, 2, 2, 2),
  //       new Workspace('2017_GEO_IMPACT_ANALYSIS', 1,'Rohit', 1, 1, 4, 2)
  //   ];
  // }



}