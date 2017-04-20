#!/bin/sh
sbt ";project dbService;run -Dhttp.port=9005"