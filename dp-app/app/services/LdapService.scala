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

package services
import java.util
import javax.inject.Singleton
import javax.naming.directory.{DirContext, SearchControls, SearchResult}
import javax.naming._
import javax.naming.ldap.InitialLdapContext

import com.google.inject.Inject
import com.google.inject.name.Named
import play.api.Configuration

import scala.concurrent.ExecutionContext.Implicits.global
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, LdapConfiguration}
import com.hortonworks.dataplane.commons.domain.Ldap.{LdapGroup, LdapSearchResult, LdapUser}
import com.hortonworks.dataplane.db.Webservice.{ConfigService, LdapConfigService}
import com.typesafe.scalalogging.Logger
import models.{CredentialEntry, KnoxConfigInfo, KnoxConfigUpdateInfo, WrappedErrorsException}

import scala.collection.mutable.ArrayBuffer
import scala.concurrent.Future
import scala.util.Left

@Singleton
class LdapService @Inject()(
                             @Named("ldapConfigService") val ldapConfigService: LdapConfigService,
                             @Named("configService") val configService: ConfigService,
                             private val ldapKeyStore: DpKeyStore,
                             private val configuration: Configuration) {
  private val logger = Logger(classOf[LdapService])

  def configure(knoxConf: KnoxConfigInfo,requestHost:String): Future[Either[Errors, Boolean]] = {
    if (knoxConf.bindDn.isEmpty || knoxConf.password.isEmpty) {
      Future.successful(
        Left(Errors(Seq(Error("400", "username and password mandatory")))))
    } else {
      validate(knoxConf) match {
        case Left(errors) => Future.successful(Left(errors))
        case Right(isValid) => {
          if (!isValid) {
            Future.successful(
              Left(Errors(Seq(Error("400", "invalid knox configuration")))))
          } else {
            validateBindDn(knoxConf.ldapUrl,knoxConf.bindDn,knoxConf.password).flatMap {
              case Left(errors) => Future.successful(Left(errors))
              case Right(isBound) => {
                val tryToWrite = ldapKeyStore.createCredentialEntry(
                  knoxConf.bindDn.get,
                  knoxConf.password.get
                )
                Future.fromTry(tryToWrite)
                  .map { _ =>
                    LdapConfiguration(id = None,
                      ldapUrl = Some(knoxConf.ldapUrl),
                      bindDn = knoxConf.bindDn,
                      userSearchBase = knoxConf.userSearchBase,
                      userSearchAttributeName = knoxConf.userSearchAttributeName,
                      groupSearchBase = knoxConf.groupSearchBase,
                      groupSearchAttributeName = knoxConf.groupSearchAttributeName,
                      groupObjectClass = knoxConf.groupObjectClass,
                      groupMemberAttributeName = knoxConf.groupMemberAttributeName
                    )
                  }
                  .flatMap { config =>
                    ldapConfigService
                      .create(config)
                      .map {
                        case Left(errors) => Left(errors)
                        case Right(createdLdapConfig) => {
                          configService.setConfig("dp.knox.whitelist",requestHost)
                          Right(true)
                        }
                      }
                  }
                  .recover {
                    case ex: Exception => Right(false)
                  }
              }
            }
          }
        }
      }
    }
  }

  def updateKnoxConfig(knoxConfig:KnoxConfigUpdateInfo): Future[Either[Errors, Boolean]]={
    validateBindDn(knoxConfig.ldapUrl,knoxConfig.bindDn,knoxConfig.password).flatMap {
      case Left(errors) =>Future.successful(Left(errors))
      case Right(isBound) => {
        val tryToWrite = ldapKeyStore.createCredentialEntry(
          knoxConfig.bindDn.get,
          knoxConfig.password.get
        )
        Future.fromTry(tryToWrite)
          .map { _ =>
            LdapConfiguration(id=Some(knoxConfig.id),ldapUrl = Some(knoxConfig.ldapUrl),bindDn = knoxConfig.bindDn)
          }.flatMap{ldapConfig=>
          ldapConfigService.update(ldapConfig).map{
            case Left(errors) => Left(errors)
            case Right(result) => Right(result)
          }
        }
      }
    }
  }


  def validate(knoxConf: KnoxConfigInfo): Either[Errors, Boolean] = {
    if (knoxConf.userSearchBase.isEmpty || knoxConf.userSearchAttributeName.isEmpty){
      Left(
        Errors(Seq(Error("invalid config", "user dn template mandatory"))))
    }else{
      Right(true)
    }
  }
  def validateBindDn(ldapUrl:String,bindDn:Option[String],password:Option[String]
                  ): Future[Either[Errors, Boolean]] = {
    getLdapContext(ldapUrl,
      bindDn.get,
      password.get).map{ctx=>
      ctx.close()
      Right(true)
    }.recoverWith{
      case e: WrappedErrorsException =>
        Future.successful(Left(e.errors))
    }
  }

  def doWithEither[T, A](
                          either: Either[Errors, T],
                          f: T => Future[Either[Errors, A]]): Future[Either[Errors, A]] = {
    either match {
      case Left(errors) => Future.successful(Left(errors))
      case Right(t) => f(t)
    }
  }

  def search(
              userName: String,
              searchType: Option[String],
              fuzzyMatch: Boolean): Future[Either[Errors, Seq[LdapSearchResult]]] =
    for {
      configuredLdap <- getConfiguredLdap
      dirContext <- doWithEither[Seq[LdapConfiguration], DirContext](
        configuredLdap,
        validateAndGetLdapContext)
      search <- doWithEither[DirContext, Seq[LdapSearchResult]](
        dirContext,
        context => {
          try{
            val searchResult = ldapSearch(context, configuredLdap.right.get, userName, searchType,fuzzyMatch)
            searchResult.onComplete{ res =>
              context.close()
            }
            searchResult
          }
        })

    } yield search

  private def getUserDetailFromLdap(dirContext: DirContext, ldapConfs: Seq[LdapConfiguration], userName: String) = {
    ldapSearch(dirContext, ldapConfs, userName, Some("user"), fuzzyMatch = false)
  }

  private def validateAndGetLdapContext(
                                         configuredLdap: Seq[LdapConfiguration]):Future[Either[Errors,DirContext]] = {
    //TODO bind dn validate.
    configuredLdap.headOption match {
      case Some(l)=>{
        val cred: Option[CredentialEntry] = ldapKeyStore.getCredentialEntry(l.bindDn.get).toOption
        cred match {
          case Some(cred) =>
            getLdapContext(l.ldapUrl.get, l.bindDn.get, cred.password).map{ ctx=>
              Right(ctx)
            }.recoverWith{
              case e: WrappedErrorsException =>
                Future.successful(Left(e.errors))
            }
          case None =>{
            Future.successful(Left(Errors(Seq(Error("Exception", "no password ")))))
          }
        }
      }
      case None=>{
        Future.successful(Left(Errors(Seq(Error("409", "LDAP is not yet configured.")))))
      }
    }
  }

  def getPassword(bindDn:String):Option[String]={
    val cred: Option[CredentialEntry]=ldapKeyStore.getCredentialEntry(bindDn).toOption
    if (cred.isDefined)Some(cred.get.password) else None
  }

  private def ldapSearch(
                          dirContext: DirContext,
                          ldapConfs: Seq[LdapConfiguration],
                          userName: String,
                          searchType: Option[String],
                          fuzzyMatch: Boolean): Future[Either[Errors, Seq[LdapSearchResult]]] = {
    val groupSerch=if (searchType.isDefined && searchType.get=="group")true else false
    if (groupSerch){
      ldapGroupSearch(dirContext,ldapConfs,userName)
    }else{
      val searchControls: SearchControls = new SearchControls()
      searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE)
      try {
        if (ldapConfs.head.userSearchBase.isEmpty || ldapConfs.head.userSearchAttributeName.isEmpty){
          Future.successful(Left(Errors(Seq(Error(
            "Exception",
            "User search base and user search attribute must be configured.")))))
        }else{
          val userSearchBase=ldapConfs.head.userSearchBase.get
          val userSearchAttributeName=ldapConfs.head.userSearchAttributeName.get
          val searchParam=s"$userSearchAttributeName=$userName*"
          val res: NamingEnumeration[SearchResult] =
            dirContext.search(userSearchBase, searchParam, searchControls)
          val ldapSearchResults: ArrayBuffer[LdapSearchResult] = new ArrayBuffer()
          while (res.hasMore) {
            val sr: SearchResult = res.next()
            val ldaprs = new LdapSearchResult(
              sr.getAttributes.get(userSearchAttributeName).get().toString,
              sr.getClassName,
              sr.getNameInNamespace)
            ldapSearchResults += ldaprs
          }
          Future.successful(Right(ldapSearchResults))
        }
      } catch {
        case e: Exception =>
          logger.error("exception", e)
          Future.successful(
            Left(Errors(Seq(Error("Exception", e.getMessage)))))
      }
    }
  }

  private def ldapGroupSearch(  dirContext: DirContext,
                                ldapConfs: Seq[LdapConfiguration],groupName:String):Future[Either[Errors, Seq[LdapSearchResult]]]={
    val groupSearchBase=ldapConfs.head.groupSearchBase
    if (groupSearchBase.isEmpty || ldapConfs.head.groupSearchAttributeName.isEmpty){
      Future.successful(Left(Errors(Seq(Error("Exception", "Group search base must be configured")))))
    }else{
      val searchControls: SearchControls = new SearchControls()
      searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE)
      val groupSearchBase=ldapConfs.head.groupSearchBase.get
      val groupSearchAttributeName=ldapConfs.head.groupSearchAttributeName.get
      val searchParam=s"$groupSearchAttributeName=$groupName*"
      val res: NamingEnumeration[SearchResult]=dirContext.search(groupSearchBase,searchParam,searchControls)
      val ldapSearchResults: ArrayBuffer[LdapSearchResult] = new ArrayBuffer()
      while (res.hasMore) {
        val sr: SearchResult = res.next()
        val ldaprs = new LdapSearchResult(
          sr.getAttributes.get(groupSearchAttributeName).get().toString,
          sr.getClassName,
          sr.getNameInNamespace)
        ldapSearchResults += ldaprs
      }
      Future.successful(Right(ldapSearchResults))
    }
  }
  def getUserGroups(userName:String):  Future[Either[Errors,LdapUser]] ={
    for {
      configuredLdap <- getConfiguredLdap
      dirContext <- doWithEither[Seq[LdapConfiguration], DirContext](
        configuredLdap,
        validateAndGetLdapContext)
      search <- doWithEither[DirContext, LdapUser](
        dirContext,
        context => {
          val groups = getUserAndGroups(context, configuredLdap.right.get, userName)
          groups.onComplete{ res =>
              context.close()
            }
          groups
        })
    } yield search

  }

  private def getUserAndGroups(  dirContext: DirContext,
                                 ldapConfs: Seq[LdapConfiguration],userName:String):
  Future[Either[Errors, LdapUser]]={
    var ldapConf=ldapConfs.head
    validateGroupSettings(ldapConf) match {
      case Some(errors)=>Future.successful(Left(errors))
      case _ =>{
        val groupSearchBase=ldapConf.groupSearchBase
        getUserDetailFromLdap(dirContext,ldapConfs, userName).map{
          case Left(errors)=>Left(errors)
          case Right(userSearchResults)=>{
            userSearchResults.headOption match {
              case None=>Left(Errors(Seq(Error("No user", "There is no such user"))))
              case Some(userRes)=>{
                val groupSearchControls = new SearchControls
                groupSearchControls.setSearchScope(SearchControls.SUBTREE_SCOPE)
                val groupObjectClass=ldapConf.groupObjectClass.get;//ex "groupofnames"
                val groupMemberAttributeName=ldapConf.groupMemberAttributeName.get;//ex "member"
                val extendedGroupSearchFilter = s"(objectclass=$groupObjectClass)"
                val fullUserdn=userRes.nameInNameSpace
                var groupSearchFilter=s"(&$extendedGroupSearchFilter($groupMemberAttributeName=$fullUserdn))"
                val res: NamingEnumeration[SearchResult]= dirContext.search(groupSearchBase.get,groupSearchFilter,groupSearchControls)
                val ldapGroups: ArrayBuffer[LdapGroup]=new ArrayBuffer
                while (res.hasMore) {
                  val sr: SearchResult = res.next()
                  val ldaprs = LdapGroup(
                    sr.getAttributes.get(ldapConfs.head.groupSearchAttributeName.get).get().toString,
                    sr.getClassName,
                    sr.getNameInNamespace)
                  ldapGroups += ldaprs
                }
                val ldapUser=LdapUser(userRes.name,userRes.className,userRes.nameInNameSpace,ldapGroups)
                Right(ldapUser)
              }
            }
          }
        }
      }
    }
  }

  private def validateGroupSettings(ldapConf: LdapConfiguration):Option[Errors] = {
    if (!(ldapConf.groupSearchBase.isEmpty || ldapConf.groupObjectClass.isEmpty || ldapConf.groupMemberAttributeName.isEmpty))
      None
    else{
      val errors=ArrayBuffer.empty[Error]
      if (ldapConf.groupSearchBase.isEmpty){
        errors+=Error("Exception","Group Search base not configured")
      }
      if (ldapConf.groupObjectClass.isEmpty){
        errors+=Error("Exception","Group Search base not configured")
      }
      if (ldapConf.groupMemberAttributeName.isEmpty){
        errors+=Error("Exception","Group Member AttributeName not configured")
      }
      Some(Errors(errors.seq))
    }
  }

  def getConfiguredLdap
  : Future[Either[Errors, Seq[LdapConfiguration]]] = {
    ldapConfigService
      .get()

  }

  private def getLdapContext(
                              url: String,
                              bindDn: String,
                              pass: String): Future[ DirContext] = {
    val env = new util.Hashtable[String, String]()
    env.put(Context.INITIAL_CONTEXT_FACTORY,
      "com.sun.jndi.ldap.LdapCtxFactory")
    env.put(Context.SECURITY_AUTHENTICATION, "simple") //TODO configure for other types.
    env.put(Context.PROVIDER_URL, url)
    env.put(Context.SECURITY_PRINCIPAL, bindDn)
    env.put(Context.SECURITY_CREDENTIALS, pass)
    env.put("com.sun.jndi.ldap.connect.pool", "true")
    try {
      val ctx: DirContext = new InitialLdapContext(env, null)
      Future.successful(ctx)
    } catch {
      case e: CommunicationException=>{
        logger.error("error while getting ldapContext",e)
        val errors=Errors(Seq(Error("Communication Exception", "Could not communicate with LDAP server. Check connectivity.")))
        Future.failed(WrappedErrorsException(errors))
      }
      case e: AuthenticationException=>{
        logger.error("error while getting ldapContext",e)
        val errors=Errors(Seq(Error("Authentication Exception", "Some credentials are incorrect for LDAP")))
        Future.failed(WrappedErrorsException(errors))
      }
      case e: NamingException =>{
        logger.error("error while getting ldapContext",e)
        val errors=Errors(Seq(Error("Exception", e.getMessage)))
        Future.failed(WrappedErrorsException(errors))
      }
    }
  }
}
