package com.hortonworks.dataplane.knoxagent

import java.io.{File, FileWriter}

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import com.hortonworks.datapalane.consul.{Gateway, ZuulServer}
import com.typesafe.config.ConfigFactory

import play.api.libs.ws.ahc.AhcWSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import akka.event.Logging

object KnoxAgentMain {

  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()
  private val wsClient = AhcWSClient()
  private val dpappDelegate = new DpAppDelegate(wsClient, system)
  private val logger = Logging(system, "KnoxAgent")

  def main(args: Array[String]): Unit = {

    println("evnhome="+sys.env.get("sso.toplology.path"))

    logger.info("knox agent main started")
    process.map { res =>
      wsClient.close()
      logger.info("done knox agent")
      system.terminate()
    }
  }

  private def process: Future[Either[Throwable, Boolean]] = {
    try {
      val config = ConfigFactory.parseResources(
        KnoxAgentMain.getClass.getClassLoader,
        "application.conf")
      //TODO may be load config from command line args specs

      //val appConfig = ConfigFactory.parseFile(resourceDir / "application.conf")
      val ssoTopologyPath = sys.env.get("sso.toplology.path") match {
        case Some(value)=>value
        case None=>config.getString("sso.toplology.path")
      }
      logger.info(s"filepath==$ssoTopologyPath")
      val gateway: Gateway = new Gateway(config, null, null)
      val gatewayService: ZuulServer = gateway.getGatewayService
      val gatewayUrl =
        s"http://${gatewayService.getIp}:${gatewayService.getPort}"
      dpappDelegate
        .getLdapConfiguration(gatewayUrl)
        .map {
          case Some(knoxConfig) => {
            try {
              val knoxSsoTopologyXml = TopologyGenerator.configure(knoxConfig)
              writeTopologyToFile(knoxSsoTopologyXml, ssoTopologyPath)
              Right(true)
            } catch {
              case e: Exception =>
                logger.error(e, e.getMessage);
                Left(e)
            }
          }
          case None => {
            logger.info("No knox configuration received")
            Right(false)
          }
        }
    } catch {
      case e: Exception =>
        logger.error(e, e.getMessage)
        Future.successful(Left(e))
    }
  }

  private def writeTopologyToFile(
      knoxSsoTopologyXml: String,
      filePath: String): Either[Throwable, Boolean] = {
    try {
      val file = new File(filePath)
      new FileWriter(file) {
        write(knoxSsoTopologyXml)
        close()
      }
      Right(true)
    } catch {
      case ex: Throwable => {
        logger.error(ex, "error while writing topology file")
        Left(ex)
      }
    }
  }
}

