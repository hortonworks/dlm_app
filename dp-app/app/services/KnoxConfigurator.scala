package services

import java.io.PrintWriter
import javax.inject.Singleton

import com.google.inject.Inject
import models.KnoxConfigInfo

import scala.xml._
@Singleton
class KnoxConfigurator @Inject()( private val configuration: play.api.Configuration){

  def configure(config:KnoxConfigInfo)={
   //TODO raise and LDAPConfigChange event to Consul
  }

}
