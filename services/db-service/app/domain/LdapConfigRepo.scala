package domain

import com.google.inject.{Inject, Singleton}
import com.hortonworks.dataplane.commons.domain.Entities.{Dataset, DpConfig, LdapConfiguration, Workspace}
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import slick.lifted.ProvenShape

import scala.concurrent.Future


@Singleton
class LdapConfigRepo @Inject()(
                                protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[DpPgProfile]{
  import profile.api._

  val LdapConfigs = TableQuery[LdapConfigTable]
  def all(): Future[List[LdapConfiguration]] = db.run {
    LdapConfigs.to[List].result
  }

  def insert(ldapConfig: LdapConfiguration): Future[LdapConfiguration] = {
    db.run {
      LdapConfigs returning LdapConfigs += ldapConfig
    }
  }
  final class LdapConfigTable(tag: Tag) extends Table[LdapConfiguration](tag, Some("dataplane"), "ldap_configs"){

    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def ldapUrl = column[String]("url")
    def bindDn = column[Option[String]]("bind_dn")
    def userDnTemplate = column[Option[String]]("user_dn_template")
    def userSearchBase = column[Option[String]]("user_searchbase")
    def userSearchAttributeName = column[Option[String]]("usersearch_attributename")
    def groupSearchBase = column[Option[String]]("group_searchbase")
    def groupSearchAttributeName = column[Option[String]]("groupsearch_attributename")

    def * = (id,ldapUrl, bindDn,userDnTemplate,userSearchBase,userSearchAttributeName,groupSearchBase,groupSearchAttributeName) <> ((LdapConfiguration.apply _).tupled, LdapConfiguration.unapply)
   /* def * = (id,url, config) <> ((LdapConfiguration.apply _).tupled, LdapConfiguration.unapply)*/

  }
}
