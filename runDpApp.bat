#!/bin/sh
sbt ";project dpApp;run -DDP_APP_HOME=%cd%/dp-app"