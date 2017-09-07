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

package services

import java.text.Normalizer
import javax.inject.{Inject, Named}

import com.google.inject.Singleton
import com.hortonworks.dataplane.db.Webservice.ConfigService

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

@Singleton
class UtilityService @Inject()(@Named("configService") val configService: ConfigService) {

  def doGenerateJobName(datasetId: Long, datasetName: String): Future[String] = {
    configService.getConfig("dp.knox.whitelist")
      .map {
        case Some(whitelist) => s"${whitelist.configValue}_${datasetName}_${datasetId}"
        case None => "${datasetName}_${datasetId}"
      }
      .map(jobName => {
        Normalizer.normalize(jobName.toLowerCase(), Normalizer.Form.NFD)
          .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
          .replaceAll("[^\\p{Alnum}]+", "-")
      })
  }

}
