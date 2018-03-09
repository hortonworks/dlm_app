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

package com.hortonworks.dataplane.licensetools

import scala.collection.immutable.Map
import scala.collection.mutable
import scala.collection.immutable
import scala.io.Source
import scala.util.matching.Regex

object LicenseChecker {

  case class LicenseDefinition(category: String, license: String, dependency: String)
  case class LicenseMetadata(approvedLicenses: immutable.Set[String], prohibitedLicenses: immutable.Set[String],
                             normalizedMappings: immutable.Map[String, String])

  val licensePattern: Regex = "(\"([^\"]*)\"|[^,]*)(,|$)".r

  def normalize(a: String): String = {
    a.split(",$")(0).replace("\"", "").trim().toLowerCase()
  }

  def processLicenseLine(licenseReportFile: String, l: String): Option[LicenseDefinition] = {
    val matches = licensePattern.findAllIn(l).toArray
    matches match {
      case Array(a: String, b: String, c: String, d: String) =>
        if (licenseReportFile.contains("scala")) {
          Some(LicenseDefinition(normalize(a), normalize(b), normalize(c)))
        } else if (licenseReportFile.contains("npm")) {
          Some(LicenseDefinition("", normalize(b), normalize(a)))
        } else {
          None
        }
      case Array(a: String, b: String, c: String, d: String, e: String) =>
        Some(LicenseDefinition("", normalize(c), normalize(a)))
      case _ => None
    }
  }

  def parseLicenses(licenseReportFile: String): Set[LicenseDefinition] = {
    val licenses = Source.fromFile(licenseReportFile).getLines.toList
    val licenseDefinitions = licenses.map(l => processLicenseLine(licenseReportFile, l)).
                                                  filter(_.isDefined).map(_.get).toSet
    licenseDefinitions
  }

  def findUnrecognizedDependencies(licenseDefinitions: Set[LicenseDefinition]): Unit = {
    val unrecognizedDeps = licenseDefinitions.filter(_.license.startsWith("none specified"))
    unrecognizedDeps.foreach { u =>
      println(s"Unrecognized dependency: ${u}")
    }
  }

  def findUniqueLicenses(licenseDefinitions: Set[LicenseDefinition]): Unit = {
    val licenseToDefinitionsMap = licenseDefinitions.groupBy(_.license.toLowerCase())
    licenseToDefinitionsMap.foreach(l => println(l._1))
  }

  def readInLicenses(approvedLicensesFile: String): Set[String] = {
    Source.fromFile(approvedLicensesFile).getLines().toSet
  }


  def readInMappings(mappingsFile: String): Map[String, String] = {
    Source.fromFile(mappingsFile).getLines().toList.map {
      mappingLine => mappingLine.split('|').map(_.trim)
    }.map {
      l => {
        if (l.length == 2 && !l(1).isEmpty) {
          l(0) -> l(1)
        } else {
          l(0) -> "Unknown"
        }
      }
    }.toMap
  }

  def checkLicenses(licenseDefinitions: Set[LicenseDefinition], licenseMetadata: LicenseMetadata): Unit = {
    val unknownLicenseDefs = mutable.Set[LicenseDefinition]()
    val prohibitedLicenseDefs = mutable.Set[LicenseDefinition]()
    licenseDefinitions.foreach {
      definition =>
        val normalizedLicense = licenseMetadata.normalizedMappings.getOrElse(definition.license, "Unknown")
        normalizedLicense match {
          case "Unknown" => unknownLicenseDefs.add(definition)
          case _ => if (licenseMetadata.prohibitedLicenses.contains(normalizedLicense)) {
            prohibitedLicenseDefs.add(definition)
          }
        }
    }
    printReport("Unknown", unknownLicenseDefs)
    printReport("Prohibited", prohibitedLicenseDefs)

  }

  def printReport(header: String, definitions: mutable.Set[LicenseDefinition]): Unit = {
    for (defn <- definitions) {
      println(s"${header}|${defn.license}|${defn.dependency}")
    }
  }

  private def initializeLicenseMetadata(args: Array[String]) = {
    val approvedLicenses = readInLicenses(args(2))
    val prohibitedLicenses = readInLicenses(args(3))
    val licenseMappings = readInMappings(args(4))
    LicenseMetadata(approvedLicenses, prohibitedLicenses, licenseMappings)
  }

  def main(args: Array[String]): Unit = {
    def printUsage(prefix: String) = {
      println(s"$prefix\nUsage: scala LicenseChecker [check_licenses|uniq_licenses|unrecognized_licenses] " +
        "<license_report_file> <approved_licenses_file> <prohibited_licenses_file> <license_mapping_file>")
      System.exit(-1)
    }

    if (args.length != 5) {
      printUsage("Invalid number of arguments")
    }
    val licenseMetadata = initializeLicenseMetadata(args)

    val licenseDefinitions = parseLicenses(args(1))
    args(0) match {
      case "check_licenses" => checkLicenses(licenseDefinitions, licenseMetadata)
      case "uniq_licenses" => findUniqueLicenses(licenseDefinitions)
      case "unrecognized_licenses" => findUnrecognizedDependencies(licenseDefinitions)
      case _ => println("Unknown option")
    }
  }
}