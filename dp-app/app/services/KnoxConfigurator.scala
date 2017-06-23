package services

import java.io.PrintWriter
import javax.inject.Singleton

import com.google.inject.Inject
import models.KnoxConfigInfo

import scala.xml._
@Singleton
class KnoxConfigurator @Inject()( private val configuration: play.api.Configuration){
  private val APP_PATH = configuration.underlying.getString("DP_APP_HOME")
  private val knoxSsoTemplatePath = s"$APP_PATH/conf/templates/knoxsso.xml"
  def configure(config:KnoxConfigInfo)={
    //val xmlObj=XML.loadFile(knoxSsoTemplatePath)
    var xml={
      <topology>
        <gateway>
          {getWebAppSecurityConf}
          {configureShiroProvider(config)}
          <provider>
            <role>identity-assertion</role>
            <name>Default</name>
            <enabled>true</enabled>
          </provider>
          {configureHostMap}
         </gateway>
        <application>
          <name>knoxauth</name>
        </application>
          {configureKnoxsso(config)}
        </topology>
    }
    val xmlPrettifier = new scala.xml.PrettyPrinter(80, 4)
    val formattedXml=xmlPrettifier.format(xml)
    formattedXml
  }
  private def getWebAppSecurityConf={
    {
      <provider>
        <role>webappsec</role>
        <name>WebAppSec</name>
        <enabled>true</enabled>
        <param><name>xframe.options.enabled</name><value>true</value></param>
      </provider>
    }
  }
  private def configureHostMap={
    //TODO need to check how hostmap is useful
    <provider>
        <role>hostmap</role>
        <name>static</name>
        <enabled>true</enabled>
        <param><name>localhost</name><value>sandbox,sandbox.hortonworks.com</value></param>
    </provider>
  }
  private def configureShiroProvider(config:KnoxConfigInfo)={
     <provider>
        <role>authentication</role>
        <name>ShiroProvider</name>
        <enabled>true</enabled>
        <param>
          <name>sessionTimeout</name>
          <value>30</value>
        </param>
        <param>
          <name>redirectToUrl</name>
          <value>/gateway/knoxsso/knoxauth/login.html</value>
        </param>
        <param>
          <name>restrictedCookies</name>
          <value>rememberme,WWW-Authenticate</value>
        </param>
        <param>
          <name>main.ldapRealm</name>
          <value>org.apache.hadoop.gateway.shirorealm.KnoxLdapRealm</value>
        </param>
        <param>
          <name>main.ldapContextFactory</name>
          <value>org.apache.hadoop.gateway.shirorealm.KnoxLdapContextFactory</value>
        </param>
        <param>
          <name>main.ldapRealm.contextFactory</name>
          <value>$ldapContextFactory</value>
        </param>
        <param>
          <name>main.ldapRealm.userDnTemplate</name>
          <value>{config.userDnTemplate}</value>
        </param>
        <param>
          <name>main.ldapRealm.contextFactory.url</name>
          <value>{config.ldapUrl}</value>
        </param>
        <param>
          <name>main.ldapRealm.authenticationCachingEnabled</name>
          <value>false</value>
        </param>
        <param>
          <name>main.ldapRealm.contextFactory.authenticationMechanism</name>
          <value>simple</value>
        </param>
        <param>
          <name>urls./**</name>
          <value>authcBasic</value>
        </param>
      </provider>

  }
  private def configureKnoxsso(config:KnoxConfigInfo)={
    var ttlMilliSecs=config.signedTokenTtl match {
      case Some(ttlInMinutes)=>ttlInMinutes *60000
      case None=> -1
    }
    var httpsOnly=config.allowHttpsOnly match {
      case Some(httpsOnly)=>httpsOnly
      case None=>false
    }
    val whiteListDomains=config.domains   match {
        case Some(domains) =>{
          domains.mkString("|")
        }
        case None =>"localhost"
      }
    var xml={
    <service>
      <role>KNOXSSO</role>
      <param>
        <name>knoxsso.cookie.secure.only</name>
        <value>{httpsOnly}</value>
      </param>
      <param>
        <name>knoxsso.token.ttl</name>
        <value>{ttlMilliSecs}</value>
      </param>
      <param>
        <name>knoxsso.redirect.whitelist.regex</name>
        <value>^https?:\/\/({whiteListDomains}|localhost|127\.0\.0\.1|0:0:0:0:0:0:0:1|::1)(:[0-9])*.*$</value>
      </param>
    </service>
    }
    xml
  }
  def using[T <: { def close() }](resource: T)(block: T => Unit) {
    try {
      block(resource)
    } finally {
      if (resource != null) resource.close()
    }
  }
}
