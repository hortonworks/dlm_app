import {Workspace} from './workspace';

export class WorkspaceDTO {
  workspace: Workspace;
  username: string;
  clustername: string;
  users: number = 0;
  counts: {
    asset: number;
    notebook: number;
  };

  constructor() {
    this.counts = {asset: 0, notebook: 0};
  }
}
