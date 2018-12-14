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

import { reducer } from './beacon-cloud-cred.reducer';
import * as fromBeacon from 'actions/beacon-cloud-cred.action';
import * as fromCloudAccount from 'actions/cloud-account.action';

describe('beacon cloud cred reducer', () => {

  it('should return initial state', () => {
    const result = reducer(undefined, {});
    expect(result).toEqual({ ids: [], entities: {} });
  });

  it('should add loaded beacon cloud creds', () => {
    const action = {
      type: fromBeacon.ActionTypes.LOAD_BEACON_CLOUD_CREDS.SUCCESS,
      payload: {
        response: {
          allCloudCreds: [
            {
              clusterId: 1,
              cloudCreds: {
                cloudCred: [
                  {
                    id: '1.1',
                    name: 'beacon1',
                    configs: {
                      version: '1'
                    }
                  },
                  {
                    id: '1.2',
                    name: 'beacon2',
                    configs: {
                      version: '9'
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    };

    const result = reducer({ ids: [], entities: {} }, action);

    expect(result).toEqual(<any>{
      ids: ['beacon1', 'beacon2'],
      entities: {
        beacon1: {
          id: '1.1',
          name: 'beacon1',
          configs: {
            version: '1'
          },
          clusters: [
            {
              isInSync: null,
              clusterId: 1,
              cloudCredId: '1.1'
            }
          ]
        },
        beacon2: {
          id: '1.2',
          name: 'beacon2',
          configs: {
            version: '9'
          },
          clusters: [
            {
              isInSync: null,
              clusterId: 1,
              cloudCredId: '1.2'
            }
          ]
        }
      }
    });
  });

  it('should replace loaded beacon cloud creds', () => {
    const action = {
      type: fromBeacon.ActionTypes.LOAD_BEACON_CLOUD_CREDS.SUCCESS,
      payload: {
        response: {
          allCloudCreds: [
            {
              clusterId: 1,
              cloudCreds: {
                cloudCred: [
                  {
                    id: '1.3',
                    name: 'beacon3',
                    configs: {
                      version: '1'
                    }
                  },
                  {
                    id: '1.4',
                    name: 'beacon4',
                    configs: {
                      version: '9'
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    };

    const result = reducer({
      ids: ['beacon1', 'beacon2'],
      entities: <any>{
        beacon1: {
          id: '1.1',
          name: 'beacon1',
          configs: {
            version: '1'
          },
          clusters: [
            {
              isInSync: null,
              clusterId: 1,
              cloudCredId: '1.1'
            }
          ]
        },
        beacon2: {
          id: '1.2',
          name: 'beacon2',
          configs: {
            version: '9'
          },
          clusters: [
            {
              isInSync: null,
              clusterId: 1,
              cloudCredId: '1.2'
            }
          ]
        }
      }
    }, action);

    expect(result).toEqual(<any>{
      ids: ['beacon3', 'beacon4'],
      entities: {
        beacon3: {
          id: '1.3',
          name: 'beacon3',
          configs: {
            version: '1'
          },
          clusters: [
            {
              isInSync: null,
              clusterId: 1,
              cloudCredId: '1.3'
            }
          ]
        },
        beacon4: {
          id: '1.4',
          name: 'beacon4',
          configs: {
            version: '9'
          },
          clusters: [
            {
              isInSync: null,
              clusterId: 1,
              cloudCredId: '1.4'
            }
          ]
        }
      }
    });
  });

  it('should add loaded beacon cloud creds with policies', () => {
    const action = {
      type: fromBeacon.ActionTypes.LOAD_BEACON_CLOUD_CREDS_WITH_POLICIES.SUCCESS,
      payload: {
        response: {
          unreachableBeacon: [],
          allCloudCreds: [
            {
              name: 'beacon1',
              policies: null,
              clusters: [
                {
                  clusterId: '1',
                  cloudCredId: '1.1',
                  isInSync: false
                },
                {
                  clusterId: '2',
                  cloudCredId: '2.1',
                  isInSync: true
                }
              ]
            },
            {
              name: 'beacon2',
              policies: null,
              clusters: [
                {
                  clusterId: '3',
                  cloudCredId: '3.1',
                  isInSync: false
                },
                {
                  clusterId: '4',
                  cloudCredId: '4.1',
                  isInSync: true
                }
              ]
            }
          ]
        }
      }
    };

    const result = reducer({ ids: [], entities: {} }, action);

    expect(result).toEqual(<any>{
      ids: ['beacon1', 'beacon2'],
      entities: {
        beacon1: {
          name: 'beacon1',
          policies: null,
          clusters: [
            {
              clusterId: '1',
              cloudCredId: '1.1',
              isInSync: false
            },
            {
              clusterId: '2',
              cloudCredId: '2.1',
              isInSync: true
            }
          ]
        },
        beacon2: {
          name: 'beacon2',
          policies: null,
          clusters: [
            {
              clusterId: '3',
              cloudCredId: '3.1',
              isInSync: false
            },
            {
              clusterId: '4',
              cloudCredId: '4.1',
              isInSync: true
            }
          ]
        }
      }
    });
  });

  it('should replace loaded beacon cloud creds with policies', () => {
    const action = {
      type: fromBeacon.ActionTypes.LOAD_BEACON_CLOUD_CREDS_WITH_POLICIES.SUCCESS,
      payload: {
        response: {
          unreachableBeacon: [],
          allCloudCreds: [
            {
              name: 'beacon3',
              policies: null,
              clusters: [
                {
                  clusterId: '5',
                  cloudCredId: '5.1',
                  isInSync: false
                },
                {
                  clusterId: '6',
                  cloudCredId: '6.1',
                  isInSync: true
                }
              ]
            },
            {
              name: 'beacon4',
              policies: null,
              clusters: [
                {
                  clusterId: '7',
                  cloudCredId: '7.1',
                  isInSync: false
                },
                {
                  clusterId: '8',
                  cloudCredId: '8.1',
                  isInSync: true
                }
              ]
            }
          ]
        }
      }
    };

    const result = reducer(<any>{
      ids: ['beacon1', 'beacon2'],
      entities: {
        beacon1: {
          name: 'beacon1',
          policies: null,
          clusters: [
            {
              clusterId: '1',
              cloudCredId: '1.1',
              isInSync: false
            },
            {
              clusterId: '2',
              cloudCredId: '2.1',
              isInSync: true
            }
          ]
        },
        beacon2: {
          name: 'beacon2',
          policies: null,
          clusters: [
            {
              clusterId: '3',
              cloudCredId: '3.1',
              isInSync: false
            },
            {
              clusterId: '4',
              cloudCredId: '4.1',
              isInSync: true
            }
          ]
        }
      }
     }, action);

    expect(result).toEqual(<any>{
      ids: ['beacon3', 'beacon4'],
      entities: {
        beacon3: {
          name: 'beacon3',
          policies: null,
          clusters: [
            {
              clusterId: '5',
              cloudCredId: '5.1',
              isInSync: false
            },
            {
              clusterId: '6',
              cloudCredId: '6.1',
              isInSync: true
            }
          ]
        },
        beacon4: {
          name: 'beacon4',
          policies: null,
          clusters: [
            {
              clusterId: '7',
              cloudCredId: '7.1',
              isInSync: false
            },
            {
              clusterId: '8',
              cloudCredId: '8.1',
              isInSync: true
            }
          ]
        }
      }
    });
  });

  it('should not delete cloud store from store', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.DELETE_CLOUD_STORE.SUCCESS,
      payload: {
        response: undefined
      }
    };

    const result = reducer({ ids: [], entities: {} }, action);

    expect(result).toEqual(<any>{ ids: [], entities: {} });
  });

  it('should delete cloud store from store', () => {
    const action = {
      type: fromCloudAccount.ActionTypes.DELETE_CLOUD_STORE.SUCCESS,
      payload: {
        response: {
          id: '123'
        }
      }
    };
    const state = {
      ids: ['123', '124'],
      entities: {
        '123': {
          id: '1'
        },
        '124': {
          id: '2'
        }
      }
    };
    const result = reducer(<any>state, action);

    expect(result).toEqual(<any>{
      ids: ['124'],
      entities: {
        '124': {
          id: '2'
        }
      }
    });
  });
});
