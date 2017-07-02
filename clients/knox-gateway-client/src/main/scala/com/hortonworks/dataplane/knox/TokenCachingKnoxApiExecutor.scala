package com.hortonworks.dataplane.knox

import java.util.concurrent.TimeUnit

import com.google.common.cache.{CacheBuilder, CacheLoader}
import com.hortonworks.dataplane.knox.Knox.{KnoxApiRequest, KnoxConfig, TokenResponse}
import com.typesafe.scalalogging.Logger
import org.joda.time.DateTime
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class TokenCachingKnoxApiExecutor(c: KnoxConfig, w: WSClient) extends KnoxApiExecutor{

  val logger = Logger(classOf[TokenCachingKnoxApiExecutor])

  override val wSClient: WSClient = w
  override val config: KnoxConfig = c
  val tokenUrl = config.tokenUrl
  private val expiry = 600
  val tokenCache = CacheBuilder.newBuilder().expireAfterWrite(expiry,TimeUnit.SECONDS).build(new TokenCacheLoader())


  def getKnoxApiToken(token: String):Future[TokenResponse] = {
    logger.info("Loading token from cache")
    tokenCache.get(token).flatMap{ tr =>
      logger.info(s"Access token loaded and expires at - ${new DateTime(tr.expires)}")
      // check if expired, clear map and retry
      if(tr.expires <= new DateTime().toInstant.getMillis){
        logger.info(s"Access token expired and will be reloaded - ${new DateTime(tr.expires)}")
        tokenCache.invalidate(token)
        tokenCache.get(token)
      } else Future.successful(tr)
    }
  }


   override def execute(knoxApiRequest: KnoxApiRequest): Future[WSResponse] = {
     logger.info("Attempting to call the delegate through Knox")
    val response =  callThroughKnox(knoxApiRequest)
    // The token May expire in the time between a cache load and the actual request is made
    // In this case verify a 403 response and retry
     response.flatMap { res =>
        if(res.status == 403){
          logger.info("Service retured a 403, token may have expired; Retrying")
          // try again
          callThroughKnox(knoxApiRequest)
        } else Future.successful(res)

     }
  }


  private def callThroughKnox(knoxApiRequest: KnoxApiRequest) = {
    for {
    // First get the token
      tokenResponse <- getKnoxApiToken(
        wrapTokenIfUnwrapped(knoxApiRequest.token.get))
      // Use token to issue the complete request
      response <- makeApiCall(tokenResponse, knoxApiRequest)
    } yield response
  }

  class TokenCacheLoader extends CacheLoader[String,Future[TokenResponse]]{
    override def load(token: String): Future[TokenResponse] = {
      logger.info("Cache will load token from Knox")
      val response = wSClient
        .url(tokenUrl)
        .withHeaders("Cookie" -> token,"Content-Type" -> "application/json","Accept" -> "application/json")
        .get()
        .map { res =>
          res.json.validate[TokenResponse].get
        }

       // make sure the result is available
       for {
         res <- response
         tokenResult <- Future.successful(res)
       } yield tokenResult
    }
  }


}

