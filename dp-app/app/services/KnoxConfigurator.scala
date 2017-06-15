package services

import javax.inject.Singleton

import com.google.inject.Inject

import scala.xml._
@Singleton
class KnoxConfigurator @Inject()( private val configuration: play.api.Configuration){
  private val APP_PATH = configuration.underlying.getString("DP_APP_HOME")
  private val knoxSsoTemplatePath = s"$APP_PATH/conf/templates/knoxsso.xml"
  def configure={

    val xmlObj=XML.loadFile(knoxSsoTemplatePath)
    println("*************")
    val knoxSSoService=(xmlObj \ "topology" ).toString()
    println (s"conf=[$knoxSSoService]")

  }
  private def configureShiro={

  }
  private def configureKnoxsso={

  }
  private def configureWhitelist={

  }
  private def configureTokenTtl={

  }
  private def configureCookieSecure={

  }
}
