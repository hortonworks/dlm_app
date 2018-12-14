<!---
  HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
  
  (c) 2016-2018 Hortonworks, Inc. All rights reserved.
  
  This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
  of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
  authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
  an authorized and properly licensed third party, you do not have any rights to this code.
  
  If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
  WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
  RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
  AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
  OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
  TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
  DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
  OR LOSS OR CORRUPTION OF DATA.
-->
# dlm-web

This project was generated with [angular-cli](https://github.com/angular/angular-cli).

## NodeJS Requirement
You need NodeJS to build and run dlm-web (tested against NodeJS 6.10.2: https://nodejs.org/en/download/)

## Installing NPM packages
If you don't have `yarn` package manager already, install it via `npm -g install yarn`

Run `yarn` to install NPM packages.

When changing package versions, use `yarn upgrade` command (e.g., `yarn upgrade mypackage@1.2.0`.
This updates the package as well as `package.json` and `yarn.lock`.
Both files should be included in your commit if modified.


## Development server
Run `npm run dev` for a dev server. Navigate to `http://localhost:4444/`. The app will automatically reload if you change any of the source files. Note that API responses are mocked in dev mode
 

## Development server with Hot Module Reload
Run `npm run dev:hmr` for a dev server with hot module reload. Navigate to `http://localhost:4444`.

## Production server
Run `npm run prod` for server to run in prod mode. Navigate to `http://localhost:4444`. Ensure play app is already running on port `9005`.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Lint
Run `npm run lint` before committing changes. You may also configure your editor/IDE to make lint checks using project lint configuration.
Run `npm run lint:fix` to quickly fix misc lint errors.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
