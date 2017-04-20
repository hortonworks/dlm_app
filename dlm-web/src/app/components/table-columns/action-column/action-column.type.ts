import { ActionItemType } from './action-item.type';

export interface ActionColumnType {
  actionable: boolean;
  actions: ActionItemType[];
}
