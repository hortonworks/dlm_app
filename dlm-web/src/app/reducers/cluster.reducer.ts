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

import { Cluster } from 'models/cluster.model';
import { BaseState } from 'models/base-resource-state';
import * as fromCluster from 'actions/cluster.action';
import { toEntities } from 'utils/store-util';
import { CLUSTER_STATUS, SERVICE_STATUS } from 'constants/status.constant';

export type State = BaseState<Cluster>;

export const initialState: State = {
  entities: {}
};

const withStatus = (state, cluster) => {
  const cached = state.entities[cluster.id];
  const status = cached && cached.status || [];
  const healthStatus = cached && cached.healthStatus || CLUSTER_STATUS.UNKNOWN;
  return {
    ...cluster,
    healthStatus,
    status
  };
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    // TODO: figure out better way to link `status` object to `cluster` since they are recieved from different requests
    case fromCluster.ActionTypes.LOAD_CLUSTERS.SUCCESS: {
      const clusters = action.payload.response.clusters.map(cluster => withStatus(state, cluster));
      return {
        entities: Object.assign({}, state.entities, toEntities<Cluster>(clusters))
      };
    }
    case fromCluster.ActionTypes.LOAD_CLUSTERS_STATUSES.SUCCESS: {
      const clusterServices = {};
      if (action.payload.response.length) {
        action.payload.response.map(cluster => {
          const services = cluster.data.items || [];
          clusterServices[cluster.id] = services.map(item => item.ServiceInfo);
        });
      }
      const entities = Object.keys(state.entities).reduce((newEntities, clusterId) => {
        const status = clusterServices[clusterId];
        let clusterHealthStatus = CLUSTER_STATUS.HEALTHY;
        if (!status) {
          clusterHealthStatus = CLUSTER_STATUS.UNKNOWN;
        } else {
          if (status.some(d => d.state === SERVICE_STATUS.UNKNOWN)) {
            clusterHealthStatus = CLUSTER_STATUS.UNKNOWN;
          } else if (!!status.some(d => d.state !== SERVICE_STATUS.STARTED)) {
            clusterHealthStatus = CLUSTER_STATUS.UNHEALTHY;
          }
        }
        newEntities[clusterId] = Object.assign({}, state.entities[clusterId], {status: status || [], healthStatus: clusterHealthStatus});
        return newEntities;
      }, {});
      return {entities};
    }
    case fromCluster.ActionTypes.LOAD_CLUSTERS.FAILURE: {
      return state;
    }
    default: {
      return state;
    }
  }
}
