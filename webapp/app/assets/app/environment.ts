import {Injectable} from '@angular/core';
import {Persona} from './shared/utils/persona';
import {SearchParamWrapper} from './shared/data-plane-search/search-param-wrapper';
import {SearchParam} from './shared/data-plane-search/search-param';

@Injectable()
export class Environment {
  persona: Persona;
  loginLink: string;

  /* These are hardcoded variables */

  dataCenterName = 'Australia';
  host = '172.22.85.12';

  hiveSearchParamWrappers: SearchParamWrapper[] = [
    new SearchParamWrapper(new SearchParam('Size', '',''), ['==', '<', '>', '!=']),
    new SearchParamWrapper(new SearchParam('Number Of Rows', '',''), ['==', '<', '>', '!=']),
    new SearchParamWrapper(new SearchParam('Name', '',''), ['==', '!='])
  ];

  hbaseSearchParamWrappers: SearchParamWrapper[] = [
    new SearchParamWrapper(new SearchParam('Size', '',''), ['==', '<', '>', '!=']),
    new SearchParamWrapper(new SearchParam('Number of Rows', '',''), ['==', '<', '>', '!=']),
    new SearchParamWrapper(new SearchParam('Name', '',''), ['==', '!='])
  ];

  hivePredicates = {
    size: {
      predicate: 'parameters.totalSize ${operator} parseInt(${value})',
      qualifier: 'field'
    },
    numberOfRows: {
      predicate: 'parameters.numRows ${operator} parseInt(${value})',
      qualifier: 'field'
    },
    name: {
      predicate: 'name ${operator} ${value}',
      qualifier: 'field'
    }
  };

  hbasePredicates = {
    size: {
      predicate: 'parameters.totalSize ${operator} parseInt(${value})',
      qualifier: 'field'
    },
    numberOfRows: {
      predicate: 'parameters.numRows ${operator} parseInt(${value})',
      qualifier: 'field'
    },
    name: {
      predicate: 'name ${operator} ${value}',
      qualifier: 'field'
    }
  };

}