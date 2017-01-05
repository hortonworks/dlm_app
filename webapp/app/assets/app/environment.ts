import {Injectable} from '@angular/core';
import {Persona} from './shared/utils/persona';
import {SearchParamWrapper} from './shared/data-plane-search/search-param-wrapper';
import {SearchParam} from './shared/data-plane-search/search-param';

const OPERATOR_MAPPINGS = {
  'before': '<',
  'after': '>',
  'on': '==',
  'not on': '!=',
};
const FUNCTION_MAPPINGS = [
  'contains'
];
const buildPredicate = (lhs, rhs, operator) => {
  if(FUNCTION_MAPPINGS.indexOf(operator) >= 0) {
    return `${lhs} && ${lhs}.${operator}(${rhs})`;
  } else if(Object.keys(OPERATOR_MAPPINGS).indexOf(operator) >= 0) {
    return `${lhs} ${OPERATOR_MAPPINGS[operator]} ${rhs}`;
  } else {
    return `${lhs} ${operator} ${rhs}`;
  }
};

@Injectable()
export class Environment {
  persona: Persona;
  loginLink: string;
  DATA_CENTER_DATA_LAKE = 'Data Center';

  /* These are hardcoded variables */

  hiveSearchParamWrappers: SearchParamWrapper[] = [
    new SearchParamWrapper(new SearchParam('Size', '',''), ['==', '<', '>', '!=']),
    new SearchParamWrapper(new SearchParam('Number Of Rows', '',''), ['==', '<', '>', '!=']),
    new SearchParamWrapper(new SearchParam('Name', '',''), ['==', '!=', 'contains']),
    new SearchParamWrapper(new SearchParam('Owner', '',''), ['==', '!=', 'contains']),
    new SearchParamWrapper(new SearchParam('Created', '',''), ['before', 'after', 'on', 'not on']),
    new SearchParamWrapper(new SearchParam('Comment', '',''), ['==', '!=', 'contains']),
    new SearchParamWrapper(new SearchParam('Tags', '',''), ['==', '!=', 'contains']),
    new SearchParamWrapper(new SearchParam('Department', '',''), ['==', '!=', 'contains']),
  ];

  hbaseSearchParamWrappers: SearchParamWrapper[] = [
    new SearchParamWrapper(new SearchParam('Name', '',''), ['==', '!=']),
    new SearchParamWrapper(new SearchParam('Owner', '',''), ['==', '!='])
  ];

  hdfsSearchParamWrappers: SearchParamWrapper[] = [
    new SearchParamWrapper(new SearchParam('Name', '',''), ['contains']),
    new SearchParamWrapper(new SearchParam('Owner', '',''), ['==', '!='])
  ];


  hivePredicates = {
    size: {
      predicate: 'r.parameters.totalSize ${operator} parseInt(${value})',
      qualifier: 'field'
    },
    numberOfRows: {
      predicate: 'r.parameters.numRows ${operator} parseInt(${value})',
      qualifier: 'field'
    },
    name: {
      predicate: (rhs, operator) => buildPredicate('r.name', `'${rhs}'`, operator),
      qualifier: 'field'
    },
    owner: {
      predicate: (rhs, operator) => buildPredicate('r.owner', `'${rhs}'`, operator),
      qualifier: 'field'
    },
    created: {
      predicate: (rhs, operator) => buildPredicate('r.createTime', `'${rhs}'`, operator),
      qualifier: 'field'
    },
    comment: {
      predicate: (rhs, operator) => buildPredicate('r.comment', `'${rhs}'`, operator),
      qualifier: 'field'
    },
    tags: {
      predicate: (rhs, operator) => buildPredicate('r.tags', `'${rhs}'`, operator),
      qualifier: 'field'
    },
    department: {
      predicate: (rhs, operator) => buildPredicate('r.parameters.dept', `'${rhs}'`, operator),
      qualifier: 'field'
    },
  };

  hbasePredicates = {
    owner: {
      predicate: 'r.owner ${operator} \'${value}\'',
      qualifier: 'field'
    },
    name: {
      predicate: 'r.name ${operator} \'${value}\'',
      qualifier: 'field'
    }
  };

  hdfsPredicates = {
    owner: {
      predicate: 'r.owner ${operator} \'${value}\'',
      qualifier: 'field'
    },
    name: {
      predicate: 'r.name.indexOf(\'${value}\') !== -1',
      qualifier: 'field'
    }
  };

  constructor() {
    this.persona = Persona[localStorage.getItem('dp_userType') || 'USER'];
  }

}
