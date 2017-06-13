import {Workspace} from './workspace';

export class WorkspaceDTO {
  workspace: Workspace;
  username: string;
  clustername: string;
  users: number = 0;
  counts: {
    asset: number;
    notebook: number;
  }
}
