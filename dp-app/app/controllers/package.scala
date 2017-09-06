import scala.util.Try

/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package object controllers {
  def getModuleDependentServices(skuName: String)(implicit configuration: play.api.Configuration):Option[String] = {
    val optionalServices = Try(configuration.underlying.getString(s"$skuName.dependent.services.optional")).getOrElse("")
    val mandatoryServices = Try(configuration.underlying.getString(s"$skuName.dependent.services.mandatory")).getOrElse("")
    if(optionalServices.isEmpty){
      Option(mandatoryServices)
    }else if(mandatoryServices.isEmpty){
      Option(optionalServices)
    }else{
      Option(mandatoryServices + "," + optionalServices)
    }
  }

  def getMandatoryDependentServices(skuName: String)(implicit configuration: play.api.Configuration):Option[String] = {
    val mandatoryServices = Try(configuration.underlying.getString(s"$skuName.dependent.services.mandatory")).getOrElse("")
    Option(mandatoryServices)
  }

  def getOptionalDependentServices(skuName: String)(implicit configuration: play.api.Configuration):Option[String] = {
    val optionalServices = Try(configuration.underlying.getString(s"$skuName.dependent.services.optional")).getOrElse("")
    Option(optionalServices)
  }
}
