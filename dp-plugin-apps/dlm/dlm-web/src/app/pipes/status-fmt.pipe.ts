import { Pipe, PipeTransform } from '@angular/core';
import { capitalize } from 'utils/string-utils';

@Pipe({name: 'statusFmt'})
export class StatusFmtPipe implements PipeTransform {
  transform(status: string): string {
    return {
        'RUNNING': 'Active'
      }[status] || capitalize(status);
  }
}
