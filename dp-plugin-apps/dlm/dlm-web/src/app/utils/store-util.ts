/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */


import { BaseState } from 'models/base-resource-state';
import { cloneDeep } from 'utils/object-utils';

export enum UpdateStrategy {
  Merge,
  Set
}

export const mapToList = (entities) => Object.keys(entities).map(id => entities[id]);
export const toEntities = <T>(collection, id = 'id'): {[id: string]: T} => collection.reduce(
  (entities: {[id: string]: T}, entity: T) => Object.assign({}, entities, {
    [entity[id]]: entity
  }), {}
);

// tslint:disable-next-line:max-line-length
export const addEntity = <T>(state: BaseState<T>, entity: T, pk: string = 'id', strategy: UpdateStrategy = UpdateStrategy.Set): BaseState<T> => ({
  ...state,
  [pk]: strategy === UpdateStrategy.Set ? entity : Object.assign(cloneDeep(state.entities[pk]), entity)
});

// tslint:disable-next-line:max-line-length
export const addEntities = <T>(state: BaseState<T>, collection: T[], pk: string = 'id', strategy: UpdateStrategy = UpdateStrategy.Set): BaseState<T> => ({
  entities: strategy === UpdateStrategy.Set ? toEntities<T>(collection, pk) :
    Object.assign(cloneDeep(state.entities), toEntities<T>(collection, pk))
});

