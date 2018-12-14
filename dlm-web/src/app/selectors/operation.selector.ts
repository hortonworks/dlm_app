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

import { createSelector } from 'reselect';
import { getOperations } from './root.selector';
import { mapToList } from 'utils/store-util';
import { getAllClusters } from 'selectors/cluster.selector';
import { getCountPairsForClusters } from 'selectors/pairing.selector';
import { getAllAccounts } from 'selectors/cloud-account.selector';
import { PairsCountEntity } from 'models/pairs-count-entity.model';
import { PairsCount } from 'models/pairs-count.model';
import { Cluster } from 'models/cluster.model';
import { CloudAccount } from 'models/cloud-account.model';

export interface AvailableEntityActions {
  canAddPairing: boolean;
  canAddPolicy: boolean;
}

export const getEntities = createSelector(getOperations, state => state.entities);
export const getAllOperationResponses = createSelector(getEntities, mapToList);
export const getLastOperationResponse = createSelector(getOperations, state => state.lastResponse);

export const getAvailableEntityActions = createSelector(getAllClusters, getCountPairsForClusters, getAllAccounts,
  (clusters: Cluster[], pairsCount: PairsCountEntity, cloudAccounts: CloudAccount[]): AvailableEntityActions => {
    const pairsList: PairsCount[] = mapToList(pairsCount);
    return {
      canAddPolicy: pairsList.some(p => p.pairs > 0) || cloudAccounts.length > 0,
      canAddPairing: clusters.length > 1 && !pairsList.every(pair => pair.pairs === clusters.length - 1)
    };
  });
