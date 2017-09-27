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
import sys.process._

object KnoxAgentMain {

  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()
  private val wsClient = AhcWSClient()
  private val dpappDelegate = new DpAppDelegate(wsClient, system)
  private val logger = Logging(system, "KnoxAgent")

  def main(args: Array[String]): Unit = {
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
      val config = ConfigFactory.load()
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

            val ssoTopologyPath = config.getString("sso.toplology.path")
            logger.info(s"filepath==$ssoTopologyPath")
            val passwordUpdated=updateBindPassword(config,knoxConfig)
            if (!passwordUpdated){
              logger.error("updating bind password failed")
              Right(false)
            }else{
              val knoxSsoTopologyXml = TopologyGenerator.configure(knoxConfig)
              writeTopologyToFile(knoxSsoTopologyXml, ssoTopologyPath)
              Right(true)
            }
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
  private def updateBindPassword(config: Config,knoxConfig:KnoxConfig): Boolean ={
    val p = Promise[Boolean]
    val args=s" create-alias ldcSystemPassword --cluster knoxsso --value ${knoxConfig.password.get}"
    val knoxServerPath=config.getString("knox.server.path").trim
    val knoxClicommand=config.getString("knox.cli.cmd").trim
    val setPassWordCmd=s"${knoxServerPath}${knoxClicommand} ${args}"
    val result:Int = setPassWordCmd !;
    result==0
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

