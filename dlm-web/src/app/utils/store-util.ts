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

