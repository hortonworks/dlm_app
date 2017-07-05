package com.hortonworks.dataplane.knoxagent

import java.io.{File, FileWriter}
import java.util.concurrent.ExecutorService

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import com.hortonworks.datapalane.consul.{Gateway, GatewayHook, ZuulServer}
import com.typesafe.config.{Config, ConfigFactory}
import play.api.libs.ws.ahc.AhcWSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}
import akka.event.Logging

object KnoxAgentMain {

  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()
  private val wsClient = AhcWSClient()
  private val dpappDelegate = new DpAppDelegate(wsClient, system)
  private val logger = Logging(system, "KnoxAgent")

  def main(args: Array[String]): Unit = {
    logger.info("evnhome=" + sys.env.get("sso.toplology.path"))
    logger.info("knox agent main started")
    process
      .map {
        case Left(throwabe) => {
          logger.error(throwabe, "failed with issues")
        }
        case Right(done) => {
          logger.info(s"processing status=$done")
        }
      }
      .onComplete {
        case _ =>
          wsClient.close()
          logger.info("done knox agent")
          materializer.shutdown()
          system.terminate()
          sys.exit();
      }
  }
  private def process: Future[Either[Throwable, Boolean]] = {
    try {
      val config = ConfigFactory.parseResources(
        KnoxAgentMain.getClass.getClassLoader,
        "application.conf")
      //TODO may be load config from command line args specs
      val gateway: Gateway = new Gateway(config, null, null)
      getGatewayService(gateway).flatMap {
        case Left(throwable) => Future.successful(Left(throwable))
        case Right(gatewayService) => {
          val gatewayUrl =
            s"http://${gatewayService.getIp}:${gatewayService.getPort}"
          processConfiguration(gatewayUrl, config)
        }
      }
    } catch {
      case e: Exception =>
        logger.error(e, e.getMessage)
        Future.successful(Left(e))
    }
  }

  private def processConfiguration(gatewayUrl: String, config: Config) = {
    dpappDelegate
      .getLdapConfiguration(gatewayUrl)
      .map {
        case Some(knoxConfig) => {
          try {

            val ssoTopologyPath = sys.env.get("sso.toplology.path") match {
              case Some(value) => value
              case None => config.getString("sso.toplology.path")
            }
            logger.info(s"filepath==$ssoTopologyPath")
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
  }
  private def getGatewayService(
      gateway: Gateway): Future[Either[Throwable, ZuulServer]] = {
    val p = Promise[Either[Throwable, ZuulServer]]
    gateway.getGatewayService(new GatewayHook {
      override def gatewayDiscovered(zuulServer: ZuulServer): Unit = {
        p.success(Right(zuulServer))
      }
      override def gatewayDiscoverFailure(message: String): Unit = {
        p.success(Left(new Exception("could not discover gateway")))
      }
    })
    p.future
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

