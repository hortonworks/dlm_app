export interface TableFilterItem {
  propertyName: string;
  filterTitle?: string;
  multiple: boolean;
  values?: any[];
}

export interface AppliedFilterMapped {
  key: string;
  value: any;
}
