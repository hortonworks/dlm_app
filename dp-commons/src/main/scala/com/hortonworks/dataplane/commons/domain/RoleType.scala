package com.hortonworks.dataplane.commons.domain

object RoleType extends Enumeration{
  val SUPERADMIN=Value("SUPERADMIN")
  val INFRAADMIN=Value("INFRAADMIN")
  val USER=Value("USER")
  val CURATOR=Value("CURATOR")
}
