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
  private val searchControls: SearchControls = new SearchControls()

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
                        LdapConfiguration(knoxConf.id,
                                          knoxConf.ldapUrl,
                                          knoxConf.bindDn,
                                          knoxConf.userDnTemplate,
                                          knoxConf.userSearchBase,
                                          knoxConf.groupSearchBase)

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
    validateUserDnTemplate(knoxConf.userDnTemplate) match {
      case Left(errors) => Left(errors)
      case Right(valid) => {
        if (valid) {
          Right(true)
        } else {
          Left(
            Errors(Seq(Error("invalid config", "user dn template mandatory"))))
        }
      }
    }
  }
  private def validateUserDnTemplate(
      userDntemplateOption: Option[String]): Either[Errors, Boolean] = {
    userDntemplateOption
      .map { userDnTemplate =>
        if (!userDnTemplate.contains(USERDN_SUBSTITUTION_TOKEN)) {
          Left(
            Errors(Seq(Error("invalid config",
                             "user dn template substitution token absent"))))
        } else Right(true)
      }
      .getOrElse {
        Left(
          Errors(Seq(Error("invalid config", "user dn template mandatory")))) //TODO this may change by having advance options rather tham just userr dn template
      }
  }
  private def getUserDn(userDntemplateOpt: Option[String],
                        principal: String): Option[String] = {
    userDntemplateOpt
      .map { userDnTempate =>
        val index = userDnTempate.indexOf(USERDN_SUBSTITUTION_TOKEN)
        val prefix = userDnTempate.substring(0, index)
        val suffix = userDnTempate.substring(
          prefix.length + USERDN_SUBSTITUTION_TOKEN.length)
        Some(s"$prefix$principal$suffix")
      }
      .getOrElse(None)
  }
  private def detemineUserSearchBase(userDnTempate: String): String = {
    val index = userDnTempate.indexOf(USERDN_SUBSTITUTION_TOKEN)
    userDnTempate
      .substring(index + USERDN_SUBSTITUTION_TOKEN.length)
      .trim
      .substring(1)
  }
  private def detemineUserIdentifier(userDnTempate: String): String = {
    val index = userDnTempate.indexOf(USERDN_SUBSTITUTION_TOKEN)
    userDnTempate.substring(0, index)
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
      fuzzyMatch: Boolean): Future[Either[Errors, Seq[LdapSearchResult]]] =
    for {
      configuredLdap <- getConfiguredLdap
      dirContext <- doWithEither[Seq[LdapConfiguration], DirContext](
        configuredLdap,
        validateAndGetLdapContext)
      search <- doWithEither[DirContext, Seq[LdapSearchResult]](
        dirContext,
        context => {
          ldapSearch(context, configuredLdap.right.get, userName, fuzzyMatch)
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
      fuzzyMatch: Boolean): Future[Either[Errors, Seq[LdapSearchResult]]] = {
    searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE)
    try {
      val userDn: Option[String] =
        getUserDn(ldapConfs.head.userDnTemplate, userName)
      if (!userDn.isDefined) {
        //TODO this is temporary fix. will support advance option sooner.
        return Future.successful(Left(Errors(Seq(new Error(
          "Exception",
          "current implementation only allows search based on userDn template.")))))

      }
      val searchBase = detemineUserSearchBase(
        ldapConfs.head.userDnTemplate.get)
      var searchIdtemplate = detemineUserIdentifier(
        ldapConfs.head.userDnTemplate.get)

      val searchid =
        if (fuzzyMatch) searchIdtemplate + userName + "*"
        else searchIdtemplate + userName
      val res: NamingEnumeration[SearchResult] =
        dirContext.search(searchBase, searchid, searchControls)
      val ldapSearchResults: ArrayBuffer[LdapSearchResult] = new ArrayBuffer()
      while (res.hasMore) {
        val sr: SearchResult = res.next()
        val ldaprs = new LdapSearchResult(
          sr.getName.substring(
            sr.getName.indexOf(searchIdtemplate) + searchIdtemplate.length),
          sr.getClassName,
          sr.getNameInNamespace)
        ldapSearchResults += ldaprs
      }
      Future.successful(Right(ldapSearchResults))
    } catch {
      case e: Exception =>
        logger.error("exception", e)
        Future.successful(
          Left(Errors(Seq(new Error("Exception", e.getMessage)))))
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
    env.put(Context.PROVIDER_URL, url);
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
