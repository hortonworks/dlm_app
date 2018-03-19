/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.cs.profiler.processors.helpers

import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

object DateValidator {
  private val formatter: DateTimeFormatter = DateTimeFormat forPattern "yyyy-MM-dd"

  def validateDate(dateString: String): Future[Unit] = {
    Future(formatter parseDateTime dateString)
  }

}
