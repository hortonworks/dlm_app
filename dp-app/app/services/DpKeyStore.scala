package services

import java.io.{FileInputStream, FileOutputStream}
import java.security.{Key, KeyStore}
import javax.crypto.spec.SecretKeySpec
import javax.inject.Singleton

import play.api.Configuration
import com.google.inject.Inject
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import com.typesafe.scalalogging.Logger
import models.CredentialEntry

import scala.util.Left
//TODO thread safety while write, File permission check.
@Singleton
class DpKeyStore @Inject()(configuration: Configuration) {
  private val logger = Logger(classOf[DpKeyStore])
  private val APP_PATH = configuration.underlying.getString("DP_APP_HOME")
  private val dpKeyStoreJceksPath = s"$APP_PATH/conf/cert/dp-keystore.jck"

  private val signingKeyPass = "changeit" //TODO get from environment...
  private val keyStorePass = "mystorepass" //TODO get from environment...
  private val signingKeyAlias = "dpjceks" //TODO get from environment.
  private var keystore:KeyStore=KeyStore.getInstance("JCEKS");
  initialize
  private def initialize:Unit={
    try {
      using(new FileInputStream(dpKeyStoreJceksPath)) { is =>
        keystore.load(is, keyStorePass.toCharArray)
        logger.info("DP Keystore Initialized")
      }
    } catch {
      case e: Exception => {
        logger.error("Exception", e)
        //TODO throw exception here as app should not start with uninitialized keystore.
      }
    }
  }
  /*
  keytool -genseckey -keystore aes-keystore.jck -storetype jceks -storepass mystorepass
   -keyalg AES -keysize 256 -alias dpjceks -keypass changeit
   */
  def getCredentialEntry(name: String): Option[CredentialEntry] = {
    if (!getJckesKeyStore.containsAlias(name)) {
      None
    } else {
      val key: Key = getJckesKeyStore.getKey(name, keyStorePass.toCharArray)
      val credEnry: CredentialEntry =
        CredentialEntry(name, new String(key.getEncoded.map(_.toChar)))
      Some(credEnry)
    }
  }

  def createCredentialEntry(name: String,
                            credential: String): Either[Errors, Boolean] = {
    if (getJckesKeyStore.containsAlias(name)) {
      Left(Errors(Seq(Error("Exception", "Keystore already has this key"))))
    } else {
      val secretKeySpec: SecretKeySpec =
        new SecretKeySpec(new String(credential).getBytes("UTF-8"), "AES")
      getJckesKeyStore.setKeyEntry(name,
                                   secretKeySpec,
                                   keyStorePass.toCharArray,
                                   null)
      flush() //TODO can this be done on setting flag and on timely basis.
      Right(true)
    }
  }

  def deleteCredentialEntry(name: String): Boolean = {
    if (getJckesKeyStore.containsAlias(name)) {
      getJckesKeyStore.deleteEntry(name)
      flush() //TODO can this be done on setting flag and on timely basis.
      true
    } else {
      false
    }
  }


  private def getJckesKeyStore: KeyStore = {
    keystore
  }

  private def flush() = {
    val os: FileOutputStream = new FileOutputStream(dpKeyStoreJceksPath)
    getJckesKeyStore.store(os, keyStorePass.toCharArray)
  }
  def using[T <: { def close() }](resource: T)(block: T => Unit) {
    try {
      block(resource)
    } finally {
      if (resource != null) resource.close()
    }
  }
}
