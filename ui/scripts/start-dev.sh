#!/bin/bash
SCRIPTS_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
$SCRIPTS_ROOT/../node_modules/angular-cli/bin/ng serve --proxy-config proxy.conf.json
