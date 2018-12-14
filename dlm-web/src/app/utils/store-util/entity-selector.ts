/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { createSelector, OutputSelector, Selector } from 'reselect';
import { multiLevelResolve } from 'utils/object-utils';
import { BaseState } from 'models/base-resource-state';
import { mapToList } from './transform';
import { State } from 'reducers/index';
import { contains } from 'utils/array-util';

export interface Relationships {
  [model: string]: IRelation;
}

export type Relation = 'hasMany' | 'belongsTo' | 'belongsToThrough';

export const enum KeyTarget {
  Self,
  Related
}

export interface RelationAttributes {
  id?: string;
  target?: KeyTarget;
  entities?: any|any[];
}

export type AttributesFn<T = any> = (entity: T, related: T[]) => RelationAttributes;

export interface IRelation {
  type: Relation;
  selectorId: string;
  attributes: RelationAttributes|AttributesFn;
  nestedModelKey?: string;
}

export interface EntitiesMap<T> { [id: string]: T; }

export interface EntitySelector<T = any, S = State> {
  getEntities: OutputSelector<S, EntitiesMap<T>, Selector<BaseState<T>, EntitiesMap<T>>>;
  getAllEntities: OutputSelector<S, T[], Selector<EntitiesMap<T>, T[]>>;
  getEntityById: (id: string|number) => OutputSelector<S, T, Selector<EntitiesMap<T>, T>>;
  getAllWithRelated: any;
  getWithRelated: any;
}

const defaultAttributes: RelationAttributes = {
  id: 'id',
  target: KeyTarget.Related,
  entities: null
};

const registeredSelectors = {};

const getSelector = (selectorId: string): EntitySelector => {
  return registeredSelectors[selectorId] as EntitySelector;
};

const isIdDefined = (attributes: RelationAttributes) => !contains([undefined, null], attributes.id);

const getRelationAttributes = (relation: IRelation, entity = {}, related = []): RelationAttributes => {
  if (typeof relation.attributes === 'function') {
    return {
      ...defaultAttributes,
      ...relation.attributes(entity, related)
    };
  }
  return relation.attributes;
};

const matchKey = (entity, related, attributes: RelationAttributes): boolean => {
  const pk = attributes.id;
  if (attributes.target === KeyTarget.Self) {
    return related.id === multiLevelResolve(entity, pk);
  }
  return isIdDefined(attributes) ? multiLevelResolve(related, pk) === entity.id : false;
};

const applyBelongsTo = (entity, relation: IRelation, state) => {
  const relatedEntities = getSelector(relation.selectorId).getAllEntities;
  const attributes = getRelationAttributes(relation, entity, relatedEntities(state));
  return createSelector(relatedEntities, (related: any[]) => {
    if (attributes.entities) {
      return attributes.entities;
    }
    return isIdDefined(attributes) ? related.find(r => matchKey(entity, r, attributes)) : null;
  })(state);
};

const applyHasMany = (entity, relation: IRelation, state) => {
  const relatedEntities = getSelector(relation.selectorId).getAllEntities;
  const attributes = getRelationAttributes(relation, entity, relatedEntities(state));
  return createSelector(relatedEntities, (related: any[]) => {
    if (attributes.entities) {
      return attributes.entities;
    }
    return isIdDefined(attributes) ? related.filter(r => matchKey(entity, r, attributes)) : [];
  })(state);
};

const applyBelongsToThrough = (entity, relation: IRelation, state) => {
  const relatedEntities = getSelector(relation.selectorId).getAllWithRelated;
  const attributes = getRelationAttributes(relation, entity, relatedEntities(state));
  return createSelector(relatedEntities, (related: any[]) => {
    if (attributes.entities) {
      return attributes.entities;
    }
    const record = related.find(r => matchKey(entity, r, attributes));
    return isIdDefined(attributes) ? multiLevelResolve(record || {}, relation.nestedModelKey) : null;
  })(state);
};

type RelationFn = (entity, relation: IRelation, state) => any;
const relationFnMap: Record<Relation, RelationFn> = {
  belongsTo: applyBelongsTo,
  hasMany: applyHasMany,
  belongsToThrough: applyBelongsToThrough
};

const applyRelations = (entity, relations, state) => {
  return Object.keys(relations).reduce((acc, modelKey) => {
    const relation: IRelation = relations[modelKey];
    const relationFn = relationFnMap[relation.type];
    return { ...acc, [modelKey]: relationFn(entity, relation, state) };
  }, {});
};

const generateRelationsSelector = (relations: {[model: string]: IRelation}, allEntities) => state => {
  return createSelector(allEntities, (entities: any[]) => {
    return entities.map(entity => ({
      ...entity,
      ...applyRelations(entity, relations, state)
    }));
  })(state);
};

const passKeys = (relationships: Relationships, ...modelKeys): Relationships => Object.keys(relationships)
  .reduce((acc, key) => ({
    ...acc,
    ...(contains(modelKeys, key) ? {[key] : relationships[key]} : {})
  }), {});

export const belongsTo = (selectorId: string, attributes: RelationAttributes|AttributesFn = defaultAttributes): IRelation => {
  return {
    type: 'belongsTo',
    selectorId,
    attributes
  };
};

export const hasMany = (selectorId: string, attributes: RelationAttributes|AttributesFn = defaultAttributes): IRelation => {
  return {
    type: 'hasMany',
    selectorId,
    attributes
  };
};

// TODO: nestedModelKey may not be present. Add some assertion
export const belongsToThrough = (
  selectorId: string,
  nestedModelKey: string,
  attributes: RelationAttributes|AttributesFn = defaultAttributes
): IRelation => {
  return {
    type: 'belongsToThrough',
    attributes,
    nestedModelKey,
    selectorId
  };
};

// TODO: more comments and examples. Please see test for now
// TODO: handle cyclic dependencies in deep relationships
export const createEntitySelector = <T = any, S = State>(
  name: string,
  stateSelector: Selector<S, BaseState<T>>,
  relationships: Relationships = {}
): EntitySelector<T, S> => {
  const getEntities = createSelector(stateSelector, (s: BaseState<T>): EntitiesMap<T> => s.entities);
  const getAllEntities = createSelector(getEntities, (entities: EntitiesMap<T>) => mapToList<T>(entities));
  const getEntityById = (id) => createSelector(getEntities, (entities: EntitiesMap<T>): T => entities[id]);
  const getAllWithRelated = generateRelationsSelector(relationships, getAllEntities);
  const getWithRelated = (id) => createSelector(generateRelationsSelector(relationships, state => {
    const entity = getEntityById(id)(state);
    return entity ? [entity] : [];
  }), (entities) => entities[0]);
  const getPartialAllWithRelated = (...modelKeys) => generateRelationsSelector(passKeys(relationships, modelKeys), getAllEntities);
  const getPartialWithRelated = (id, ...modelKeys) =>
    createSelector(
      generateRelationsSelector(passKeys(relationships, modelKeys), state => [getEntityById(id)(state)]),
      (entities) => entities[0]
    );

  const selectors = {
    getEntities,
    getAllEntities,
    getEntityById,
    getAllWithRelated,
    getWithRelated,
    getPartialAllWithRelated,
    getPartialWithRelated
  };
  registeredSelectors[name] = selectors;

  return selectors;
};
