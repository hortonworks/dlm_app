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

package com.hortonworks.dataplane.commons.service.api


import com.google.inject.Inject
import com.hortonworks.dataplane.commons.domain.Entities._
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global


class SecretManager @Inject()(config: Config)(implicit ws: WSClient) {

  private def vault_address = Option(System.getProperty("vault.uri")).getOrElse(config.getString("vault.uri"))

  val credentialManager = new CredentialManager(config.getString("dp.keystore.path"), config.getString("dp.keystore.password"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def initializeVault(): Future[VaultInitResponse] = {
    ws.url(s"$vault_address/v1/sys/init")
      .put(Json.toJson(VaultInitRequest(config.getInt("vault.keyCount"), config.getInt("vault.keyThreshold"))))
      .map(mapToInitResponse)
  }

  def unsealVault(keys: Seq[String])= {
     val futures = keys.map { key =>
        unseal(key)
     }

    Future.sequence(futures)
  }

  def enableAppRole(token: String, path: String, description: String): Future[Boolean] = {
    ws.url(s"$vault_address/v1/sys/auth/$path")
      .withHeaders("X-Vault-Token" -> token)
      .post(Json.toJson(VaultAuthEnableRequest("approle", description)))
      .map {
        res =>  res.status match {
          case 204 => true
          case _ => throw new Exception("AppRole Auth could not be enabled")
        }
      }
  }


  def createAppRole(path:String, roleName: String, token: String) = {
    ws.url(s"$vault_address/v1/auth/$path/role/$roleName")
      .withHeaders("X-Vault-Token" -> token)
      .post(Json.toJson(VaultAppRoleRequest(Seq("my-policy"))))
      .map {
        res =>  res.status match {
          case 204 => true
          case _ => throw new Exception("AppRole could  not be created")
        }
      }
  }

  def getToken(path:String, roleName: String, token: String): Future[VaultAppTokenResponse] = {
   val res =  for{
      roleCreated <- createAppRole(path, roleName, token)
      roleIdData <- getRoleId(path, roleName, token)
      secretIdData <- getSecretId(path, roleName, token)
    }yield{
      getAppToken(path, roleIdData.data.role_id, secretIdData.data.secret_id, token)
    }
    res.flatMap{
      resp => resp
    }
//    credentialManager.read("vault_secret", Set("keys", "token")).map{secret =>
//      secret.values.toList.map(x => new String(x, "UTF-8")) match {
//        case List(keys, token) => {
//          for{
//            roleIdData <- getRoleId(roleName, token)
//            secretIdData <- getSecretId(roleName, token)
//          }yield{
//            getAppToken(roleIdData.data.role_id, secretIdData.data.secret_id, token)
//          }
//        }
//      }
//    }.recover {
//      case ex: CredentialNotFoundInKeystoreException => ex
//    }
  }

  private def getAppToken(path:String, roleId: String, secretId: String, token: String): Future[VaultAppTokenResponse] = {
    ws.url(s"$vault_address/v1/auth/$path/login")
      .withHeaders("X-Vault-Token" -> token)
      .post(Json.toJson(VaultAppTokenRequest(roleId, secretId)))
      .map {
        res =>  res.status match {
          case 200 => res.json.validate[VaultAppTokenResponse].get
          case _ => throw new Exception("Could not get token")
        }
      }
  }

  private def getRoleId(path:String, roleName:String, token: String): Future[VaultRoleIdResponse] = {
    ws.url(s"$vault_address/v1/auth/$path/role/$roleName/role-id")
      .withHeaders("X-Vault-Token" -> token)
      .get()
      .map {
        res =>  res.status match {
          case 200 => res.json.validate[VaultRoleIdResponse].get
          case _ => throw new Exception("Role id could not be created")
        }
      }
  }

  private def getSecretId(path:String, roleName: String, token: String): Future[VaultSecretIdResponse] = {
    ws.url(s"$vault_address/v1/auth/$path/role/$roleName/secret-id")
      .withHeaders("X-Vault-Token" -> token)
      .post(Json.toJson(VaultSecretIdRequest("")))
      .map {
        res =>  res.status match {
          case 200 => res.json.validate[VaultSecretIdResponse].get
          case _ => throw new Exception("Could not get secret id")
        }
      }
  }

  private def unseal(key: String): Future[VaultUnsealResponse] = {
    ws.url(s"$vault_address/v1/sys/unseal")
      .put(Json.toJson(VaultUnsealRequest(key)))
      .map(mapToUnsealResponse)
  }

  private def mapToInitResponse(res: WSResponse): VaultInitResponse = {
    res.status match {
      case 200 => res.json.validate[VaultInitResponse].get
      case _ => throw new Exception("Failed to initialize vault")
    }
  }

  private def mapToUnsealResponse(res: WSResponse): VaultUnsealResponse = {
    res.status match {
      case 200 => res.json.validate[VaultUnsealResponse].get
       case _ => throw new Exception("Failed to unseal")
    }
  }

  def readFromVault(path: String, token: String) {
    ws.url(s"$vault_address/v1/secret/$path")
      .withHeaders("X-Vault-Token" -> token)
      .get()
      .map {
        res =>  res.status match {
          case 200 => res.json
          case _ => throw new Exception("Secret could not be read from Vault")
        }
      }
  }

//  def mountSecretBackend(path: String, token: String): Unit ={
//    ws.url(s"$vault_address/v1/sys/mounts/$path")
//      .withHeaders("X-Vault-Token" -> token)
//      .post(Json.toJson(VaultMountRequest("kv")))
//      .map {
//        res =>
//          res.status match {
//            case 200 => true
//            case _ => throw new Exception("Failed to mount secret backend")
//          }
//      }
//  }

  def writeToVault(secret:Map[String, String], path: String, token: String) = {
    ws.url(s"$vault_address/v1/secret/$path")
      .withHeaders("X-Vault-Token" -> token)
      .post(Json.toJson(secret))
      .map {
        res =>  res.status match {
          case 204 => true
          case _ => throw new Exception("Failed to write Vault")
        }
      }
  }
}
