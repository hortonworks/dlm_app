import { TemplateRef } from '@angular/core';

/**
 * Common interface to define component as column for TableComponent
 */
export interface TableColumn {
  cellRef: TemplateRef<any>;
};
