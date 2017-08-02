import { Pipe, PipeTransform } from '@angular/core';

export function truncate(value: string, maxNumber: number): string {
  return value && value.length > maxNumber ? value.slice(0, maxNumber - 3) + '...' : value;
}

/*
 * Truncate value if it is longer than maxNumber
 * Usage:
 *   value | truncate:maxNumber
 * Example:
 *   {{ "very long string" | truncate:12}}
 *   formats to: very long...
 */
@Pipe({name: 'truncate'})
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxNumber: number): string {
    return truncate(value, maxNumber);
  }
}
