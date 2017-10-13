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

package com.hortonworks.dataplane.bcrypter

import org.mindrot.jbcrypt.BCrypt
import com.typesafe.scalalogging.LazyLogging

object BCrypterMain extends LazyLogging {

  def main(args: Array[String]): Unit = {
    args.toList.length match {
      case 0 => {
        logger.error("invalid usage")
        sys.exit(1)
      }
      case _ => print(BCrypt.hashpw(args(0).toString, BCrypt.gensalt()))
    }
  }
}

