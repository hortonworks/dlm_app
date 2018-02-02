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

package com.hortonworks.dataplane.cs

import java.util.concurrent.ConcurrentHashMap
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.service.api.{CredentialManager, CredentialNotFoundInKeystoreException, CredentialReloadEvent}
import com.typesafe.config.Config

import scala.concurrent.Future
import scala.collection.{concurrent, mutable}
import scala.collection.JavaConverters._
import scala.concurrent.ExecutionContext.Implicits.global


trait CredentialInterface {
  def getCredential(key: String): Future[Credentials]

  def onReload(key: String, callback: Unit => Unit): Unit
}

@Singleton
class CredentialInterfaceImpl @Inject()(val config: Config) extends CredentialInterface with mutable.Subscriber[CredentialReloadEvent, mutable.Publisher[CredentialReloadEvent]] {

  private val storePath = config.getString("dp.keystore.path")
  private val storePassword = config.getString("dp.keystore.password")

  private val credentialManager = new CredentialManager(storePath, storePassword)

  private val callbacks: concurrent.Map[String, Unit => Unit] = new ConcurrentHashMap[String, Unit => Unit]().asScala

  // subscribe for events
  credentialManager.subscribe(this)

  override def getCredential(key: String): Future[Credentials] =
    Future
      .fromTry(
        credentialManager.readUserCredential(key)
        .map (credential => Credentials(Some(credential._1), Some(credential._2)))
        .recover {
          case ex: CredentialNotFoundInKeystoreException => Credentials(Some(config.getString(s"$key.username")), Some(config.getString(s"$key.password")))
        })

  override def onReload(key: String, callback: Unit => Unit): Unit = {
    callbacks.put(key, callback)
  }

  override def notify(publisher: mutable.Publisher[CredentialReloadEvent], event: CredentialReloadEvent): Unit = {
    callbacks.values.foreach(cCallback => cCallback())
  }
}
