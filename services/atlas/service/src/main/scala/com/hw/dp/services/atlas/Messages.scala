package com.hw.dp.services.atlas

import org.springframework.web.client.RestTemplate

case class GetDb(database: Database,fetchUrl:String,template:RestTemplate)
case class GetTable(table: String,fetchUrl:String,template:RestTemplate)

