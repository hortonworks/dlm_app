import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'breadCrumbName'})
export class BreadCrumbNamePipe implements PipeTransform {

  transform(name: string): string {
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name;
  }
}
