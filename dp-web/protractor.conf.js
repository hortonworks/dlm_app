/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

/*global jasmine */
const SpecReporter = require('jasmine-spec-reporter');
const shell = require('shelljs');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './e2e/sign-in.e2e-spec.ts',
    './e2e/onboard-welcome.e2e-spec.ts',
    './e2e/identity-provider.e2e-spec.ts',
    // './e2e/users-and-groups.e2e-spec.ts',
    './e2e/knox-sign-in.e2e-spec.ts',
    './e2e/onboard-welcome-after-idp.e2e-spec.ts',
    './e2e/identity.e2e-spec.ts',
    './e2e/infra/user-mgmt/users-list.e2e-spec.ts',
    './e2e/infra/user-mgmt/groups-list.e2e-spec.ts',
    './e2e/infra/clusters/cluster-add.e2e-spec.ts',
    './e2e/infra/services/service-enablement.e2e-spec.ts',
    './e2e/infra/services/service-verification.e2e-spec.ts',
    './e2e/infra/clusters/lake-list.e2e-spec.ts'
    './e2e/dss/dashboard-spec.ts',
    './e2e/dss/createCollection-spec.ts',
    './e2e/dss/dashboard-with-collections-spec.ts'

  ],
  multiCapabilities: [{
  //   'browserName': 'firefox',
  //   'moz:firefoxOptions': {
  //     'args': [
  //       '--headless',
  //     ],
  //   },
  // }, {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': [
        // '--headless',
        '--disable-extensions',
        '--disable-web-security',
        '--disk-cache-size=1',
        '--media-cache-size=1',
        '--start-maximized',
        '--disable-gpu',
      ],
    },
  }],
  directConnect: true,
  baseUrl: 'http://localhost:4200',
  // baseUrl: 'https://dataplane',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {},
  },
  useAllAngular2AppRoots: true,
  rootElement: 'data-plane',
  beforeLaunch: function() {
    require('ts-node').register({
      project: 'e2e'
    });
  },
  
  onPrepare: function () {
    jasmine.getEnv().addReporter(new SpecReporter({ displayStacktrace: 'specs' }));

    // cleanup db
    shell.pushd('../services/db-service/db');
    shell.exec('flyway clean migrate');
    shell.popd();
  },
	// Turn off control flow (https://github.com/angular/protractor/tree/master/exampleTypescript/asyncAwait)
  SELENIUM_PROMISE_MANAGER: false,
};
