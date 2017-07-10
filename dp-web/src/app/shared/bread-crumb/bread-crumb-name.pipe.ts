import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'breadCrumbName'})
export class BreadCrumbNamePipe implements PipeTransform {
  static transforms = {
    datasteward: 'Data Steward',
    infra: 'Infra Admin'
  };

  transform(name: string): string {
    if (BreadCrumbNamePipe.transforms[name]) {
      name = BreadCrumbNamePipe.transforms[name];
    }

    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name;
  }
}
