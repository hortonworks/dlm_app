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

import * as fromCloudContainer from 'actions/cloud-container.action';
import { toEntities } from 'utils/store-util';
import { BaseState } from 'models/base-resource-state';
import { groupByKey } from 'utils/array-util';
import { WasbContainer } from 'models/wasb-container.model';
import { AwsBucket } from 'models/aws-bucket.model';
import { AdlsContainer } from 'models/adls-container.model';

export interface State {
  WASB: BaseState<WasbContainer>;
  AWS: BaseState<AwsBucket>;
  ADLS: BaseState<AdlsContainer>;
}

export const initialState: State = {
  WASB: {
    entities: {}
  },
  AWS: {
    entities: {}
  },
  ADLS: {
    entities: {}
  }
};

export function reducer(state = initialState, action): State {
  switch (action.type) {
    case fromCloudContainer.ActionTypes.LOAD_CONTAINERS.SUCCESS: {
      const containers = action.payload.response.map(c => {
        c.id = `${c.name}_${c.accountId}`;
        return c;
      });
      const containersMap: any = groupByKey(containers, 'provider');
      return {
        WASB: {
          entities: Object.assign({}, state.WASB.entities, toEntities<WasbContainer>(containersMap.WASB || []))
        },
        AWS: {
          entities: Object.assign({}, state.AWS.entities, toEntities<AwsBucket>(containersMap.AWS || []))
        },
        ADLS: {
          entities: Object.assign({}, state.ADLS.entities, toEntities<AdlsContainer>(containersMap.ADLS || []))
        }
      };
    }
    default: {
      return state;
    }
  }
}
