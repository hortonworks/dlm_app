package internal.auth

import java.security.cert.X509Certificate

import internal.Jwt
import play.api.http.Status
import play.api.mvc._
import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webserice.UserService

import scala.concurrent.Future
import internal.KnoxSso
import com.google.inject.Inject
import com.google.inject.name.Named
import play.api.Configuration
import play.api.Logger

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
// TODO: try http://stackoverflow.com/a/29505015/640012


class Authenticated  @Inject()(@Named("userService") userService: UserService,
                               configuration: Configuration,
                               knoxSso:KnoxSso) extends ActionBuilder[AuthenticatedRequest] {

  private val apiCallTimeout = configuration.underlying.getLong("apicall.timeout").millis
  private val ssoLoginValidCookieName="sso_login_valid"
  def invokeBlock[A](request: Request[A], block: (AuthenticatedRequest[A]) => Future[Result]) = {
    if (knoxSso.isSsoConfigured() && !request.cookies.get(knoxSso.getSsoCookieName).isDefined){
      Logger.info(s"Sso is configured but ssocookie ${knoxSso.getSsoCookieName} is not found. " +
        s"Please check the domain name or sub domain of knox and dp app")
    }
    if (knoxSso.isSsoConfigured && request.cookies.get(knoxSso.getSsoCookieName).isDefined) {
      Logger.debug("sso cookie is found")
      val serializedJWT: String = request.cookies.get(knoxSso.getSsoCookieName).get.value
      val jwtValidation: Either[Exception, (String, Long)] = knoxSso.validateJwt(serializedJWT)
      jwtValidation match {
        case Left(errors) =>
          Future.successful(Results.Unauthorized.discardingCookies(DiscardingCookie(ssoLoginValidCookieName)))
        case Right(jwtResp) =>
          val (subject,tokenExpiry)=jwtResp
          val userFuture: Future[Either[Errors, User]] = userService.loadUser(subject)
          val userOp: Either[Errors, User] = Await.result(userFuture, apiCallTimeout)
          userOp.fold(
            errors => {
              if (errors.errors.size>0 && errors.errors(0).code.equals("404")){
                Logger.info( s"User with name[${subject}] not found in dataplane db. users authroized from external system" +
                  s" need to be synced to db.")
              }
              Logger.error(s"Error while retrieving user ${errors}")
              //TODO: domain and https to be done for proper deletiong of cookie.
              Future.successful(Results.Unauthorized.discardingCookies(DiscardingCookie(ssoLoginValidCookieName)))
            },
            user => {
              val respFuture = block(AuthenticatedRequest[A](user, request))
              val cookie = Cookie(ssoLoginValidCookieName, "true", None, "/", None, false, false) //Todo set the expiration time got from token if required.
              respFuture.map(_.withCookies(cookie))
            }
          )
      }
    } else if (request.headers.get("Authorization").isDefined && request.headers.get("Authorization").get.startsWith("Bearer ")) {
      val header: String = request.headers.get("Authorization").get
      val token = header.replace("Bearer", "").trim
      Jwt.parseJWT(token).map { user =>
        block(AuthenticatedRequest[A](user, request))
      } getOrElse Future.successful(Results.Status(Status.UNAUTHORIZED))
    }
    else
      Future.successful(Results.Status(Status.UNAUTHORIZED))
  }
}

trait AuthenticatedRequest[+A] extends Request[A] {
  val user: User
}

object AuthenticatedRequest {
  def apply[A](u: User, r: Request[A]) = new AuthenticatedRequest[A] {
    def id = r.id
    def tags = r.tags
    def uri = r.uri
    def path = r.path
    def method = r.method
    def version = r.version
    def queryString = r.queryString
    def headers = r.headers
    lazy val remoteAddress = r.remoteAddress
    def username = None
    val body = r.body
    val user = u
    override def secure: Boolean = r.secure
    override def clientCertificateChain: Option[Seq[X509Certificate]] = r.clientCertificateChain
  }
}
