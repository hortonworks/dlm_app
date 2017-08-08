/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

export const NAVIGATION = [
  {
    linksCategories: [
      {
        title: 'Data Access',
        role: 'Role1',
        links: [
          {title: 'Resource Manager', hint: 'YARN', url: ''},
          {title: 'Queue Manager', hint: 'YARN', url: ''},
          {title: 'Job History', hint: 'MapReduce', url: ''},
          {title: 'Files', url: ''},
          {title: 'SQL Query', hint: 'HIVE', url: ''},
          {title: 'Query Performance', hint: 'TEZ NoSQL', url: ''},
          {title: 'HBase Master', hint: 'HBase', url: ''},
        ]
      }
    ]
  },
  {
    linksCategories: [
      {
        title: 'Data Lifecycle',
        role: 'Role2',
        links: [
          {title: 'Data Plane', url: ''},
          {title: 'Disaster Recovery', url: ''}
        ]
      },
      {
        title: 'Operations',
        role: 'Role2',
        links: [
          {title: 'Operations', hint: 'Ambari', url: ''},
          {title: 'Activity Explorer', hint: 'SmartSense', url: ''}
        ]
      }
    ]
  },
  {
    linksCategories: [
      {
        title: 'Tools',
        role: 'Role1',
        links: [
          {title: 'Ambari Metrics', url: ''},
          {title: 'HIVE Metrics', url: ''}
        ]
      }
    ]
  }
];
