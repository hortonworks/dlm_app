package services
import java.util
import javax.inject.Singleton
import javax.naming.directory.{DirContext, SearchControls, SearchResult}
import javax.naming.{Context, NamingEnumeration, NamingException}
import javax.naming.ldap.InitialLdapContext

import com.google.inject.Inject
import com.google.inject.name.Named

import scala.concurrent.ExecutionContext.Implicits.global
import com.hortonworks.dataplane.commons.domain.Entities.{
  Error,
  Errors,
  LdapConfiguration
}
import com.hortonworks.dataplane.commons.domain.Ldap.LdapSearchResult
import com.hortonworks.dataplane.db.Webservice.{LdapConfigService, UserService}
import com.typesafe.scalalogging.Logger
import models.{CredentialEntry, KnoxConfigInfo}
import play.api.libs.ws.WSClient

import scala.collection.mutable.ArrayBuffer
import scala.concurrent.Future
import scala.util.Left

@Singleton
class LdapService @Inject()(
    @Named("userService") val userService: UserService,
    @Named("ldapConfigService") val ldapConfigService: LdapConfigService,
    private val ldapKeyStore: DpKeyStore,
    private val wSClient: WSClient,
    private val configuration: play.api.Configuration) {
  private val logger = Logger(classOf[LdapService])
  private val USERDN_SUBSTITUTION_TOKEN = "{0}"


  def configure(knoxConf: KnoxConfigInfo): Future[Either[Errors, Boolean]] = {
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
            validateBindDn(knoxConf).flatMap { res =>
              res match {
                case Left(errors) => Future.successful(Left(errors))
                case Right(isBound) => {
                  ldapKeyStore.createCredentialEntry(
                    knoxConf.bindDn.get,
                    knoxConf.password.get) match {
                    case Left(errors) => Future.successful(Left(errors))
                    case Right(isCreated) => {
                      val ldapConfiguration =
                        LdapConfiguration(id=knoxConf.id,
                          ldapUrl=knoxConf.ldapUrl,
                          bindDn=knoxConf.bindDn,
                          userSearchBase=knoxConf.userSearchBase,
                          userSearchAttributeName=knoxConf.userSearchAttributeName,
                          groupSearchBase=knoxConf.groupSearchBase,
                          groupSearchAttributeName=knoxConf.groupSearchAttributeName
                        )
                      ldapConfigService.create(ldapConfiguration).map {
                        case Left(errors) => Left(errors)
                        case Right(createdLdapConfig) => Right(true)
                      }
                    }
                  }
                }
              }
            }
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

  def validateBindDn(
      knoxConf: KnoxConfigInfo): Future[Either[Errors, Boolean]] = {
    getLdapContext(knoxConf.ldapUrl,
                   knoxConf.bindDn.get,
                   knoxConf.password.get)
      .map {
        case Left(errors) => Left(errors)
        case Right(dirContext) =>
          //TODO more ops
          Right(true)
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
          ldapSearch(context, configuredLdap.right.get, userName, searchType,fuzzyMatch)
        })

    } yield search

  private def validateAndGetLdapContext(
      configuredLdap: Seq[LdapConfiguration]) = {
    //TODO bind dn validate.
    configuredLdap.headOption
      .map { l =>
        val cred: Option[CredentialEntry] =
          ldapKeyStore.getCredentialEntry(l.bindDn.get)
        cred match {
          case Some(cred) => {
            getLdapContext(l.ldapUrl, l.bindDn.get, cred.password)
          }
          case None =>
            Future.successful(
              Left(Errors(Seq(new Error("Exception", "no password ")))))
        }
      }
      .getOrElse(Future.successful(
        Left(Errors(Seq(new Error("Exception", "no configuration"))))))
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
              sr.getName.substring(userSearchAttributeName.length+1),
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
      Future.successful(Left(Errors(Seq(new Error("Exception", "Group search base must be configured")))))
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
          sr.getName.substring(groupSearchAttributeName.length+1),
          sr.getClassName,
          sr.getNameInNamespace)
        ldapSearchResults += ldaprs
      }
      Future.successful(Right(ldapSearchResults))
    }
  }
  def getUserGroups(userName:String):  Future[Either[Errors, Seq[LdapSearchResult]]] ={
    for {
      configuredLdap <- getConfiguredLdap
      dirContext <- doWithEither[Seq[LdapConfiguration], DirContext](
        configuredLdap,
        validateAndGetLdapContext)
      search <- doWithEither[DirContext, Seq[LdapSearchResult]](
        dirContext,
        context => {
          getUserGroups(context, configuredLdap.right.get, userName)
        })
    } yield search

  }

  private def getUserGroups(  dirContext: DirContext,
                      ldapConfs: Seq[LdapConfiguration],userName:String):
  Future[Either[Errors, Seq[LdapSearchResult]]]={
    val groupSearchBase=ldapConfs.head.groupSearchBase
    if (groupSearchBase.isEmpty ){
      Future.successful(Left(Errors(Seq(new Error("Exception", "Group search base must be configured")))))
    }else{
      val groupSearchControls = new SearchControls
      groupSearchControls.setSearchScope(SearchControls.SUBTREE_SCOPE)
      val groupObjectClass="groupofnames" //TODO get from conf
      val groupMemberAttributeName="member" //TODO get from conf
      val extendedGroupSearchFilter = s"(objectclass= $groupObjectClass)"
      var groupSearchFilter=s"(&$extendedGroupSearchFilter($groupMemberAttributeName={0}))"
      val userArr=List(userName).toArray[Object]
      val res: NamingEnumeration[SearchResult]=dirContext.search(groupSearchBase.get,groupSearchFilter,userArr,groupSearchControls)
      val ldapSearchResults: ArrayBuffer[LdapSearchResult]=new ArrayBuffer
      while (res.hasMore) {
        val sr: SearchResult = res.next()
        val ldaprs = new LdapSearchResult(
          sr.getName,
          sr.getClassName,
          sr.getNameInNamespace)
        ldapSearchResults += ldaprs
      }
      println(s"User group result=$ldapSearchResults")
      Future.successful(Right(ldapSearchResults))
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
      pass: String): Future[Either[Errors, DirContext]] = {
    val env = new util.Hashtable[String, AnyRef]
    env.put(Context.INITIAL_CONTEXT_FACTORY,
            "com.sun.jndi.ldap.LdapCtxFactory")
    env.put(Context.SECURITY_AUTHENTICATION, "simple") //TODO configure for other types.
    env.put(Context.PROVIDER_URL, url)
    env.put(Context.SECURITY_PRINCIPAL, bindDn)
    env.put(Context.SECURITY_CREDENTIALS, pass)
    try {
      val ctx: DirContext = new InitialLdapContext(env, null)
      Future.successful(Right(ctx))
    } catch {
      case e: NamingException =>
        Future.successful(
          Left(Errors(Seq(new Error("Exception", e.getMessage)))))
    }
  }
}
