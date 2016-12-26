package internal.auth

import java.security.cert.X509Certificate

import internal.Jwt
import models.UserView
import play.api.http.Status
import play.api.mvc.{ActionBuilder, Request, Result, Results}

import scala.concurrent.Future

// TODO: try http://stackoverflow.com/a/29505015/640012

object Authenticated extends ActionBuilder[AuthenticatedRequest] {
  def invokeBlock[A](request: Request[A], block: (AuthenticatedRequest[A]) => Future[Result]) = {
//    debug
//    block(AuthenticatedRequest[A](new UserView("admin", "admin", true), request))
    if(request.headers.get("Authorization").isDefined && request.headers.get("Authorization").get.startsWith("Bearer ")){
      val header: String = request.headers.get("Authorization").get
      val token = header.replace("Bearer","").trim
      Jwt.parseJWT(token).map{ user =>
        block(AuthenticatedRequest[A](user, request))
      } getOrElse Future.successful(Results.Status(Status.UNAUTHORIZED))
    }
    else
      Future.successful(Results.Status(Status.UNAUTHORIZED))
  }
}

trait AuthenticatedRequest[+A] extends Request[A] {
  val user: UserView
}

object AuthenticatedRequest {
  def apply[A](u: UserView, r: Request[A]) = new AuthenticatedRequest[A] {
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
