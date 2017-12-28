<!---
  Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 
  Except as expressly permitted in a written agreement between you or your company
  and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
  reproduction, modification, redistribution, sharing, lending or other exploitation
  of all or any part of the contents of this software is strictly prohibited.
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
