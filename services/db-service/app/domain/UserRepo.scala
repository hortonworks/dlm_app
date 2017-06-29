package domain

import java.time.LocalDateTime
import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{User, UserInfo, UserRole, UserRoles}
import com.hortonworks.dataplane.commons.domain.RoleType
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}

import scala.collection.mutable
import scala.collection.mutable.ArrayBuffer
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class UserRepo @Inject()(protected val dbConfigProvider: DatabaseConfigProvider,
                         protected val roleRepo: RoleRepo,
                         private val rolesUtil:RolesUtil) extends HasDatabaseConfigProvider[DpPgProfile] {

  import profile.api._

  val Users = TableQuery[UsersTable]
  val UserRoles = TableQuery[UserRolesTable]

  def all(): Future[List[User]] = db.run {
    Users.to[List].result
  }

  def allWithRoles(offset:Long=0,pageSize:Long=20): Future[Seq[UserInfo]] = {
    db.run(Users.drop(offset).take(pageSize).result).flatMap{users=>
      val userIds=users.map(res=>res.id.get).seq
      db.run(UserRoles.filter(_.userId inSet userIds).result).flatMap{userRoles=>
        val roleIdUsersMap= getRolesMap(userRoles)
        roleRepo.all().map { allRoles =>
          users.map{user=>
            val userroles = roleIdUsersMap.get(user.id.get) match {
              case Some(roles)=>rolesUtil.getRolesAsRoleTypes(roles,allRoles)
              case None => Seq()
            }
            UserInfo(id=user.id,userName=user.username,displayName = user.displayname,roles=userroles,active = user.active)
          }
        }
      }
    }
  }

  private def getRolesMap(userRoles: Seq[UserRole]) = {
    val userIdRolesMap = mutable.Map.empty[Long, ArrayBuffer[Long]]
    userRoles.foreach { userRole =>
      if (userIdRolesMap.contains(userRole.userId.get)) {
        userIdRolesMap.get(userRole.userId.get).get += userRole.roleId.get
      } else {
        val roleIdBuff = mutable.ArrayBuffer.empty[Long]
        roleIdBuff += userRole.roleId.get
        userIdRolesMap.put(userRole.userId.get,roleIdBuff)
      }
    }
    userIdRolesMap
  }

  def getUserDetail(userName:String)={
    for {
      (user, userRoles) <- getUserDetailInternal(userName)
      roleIdMap<-rolesUtil.getRoleIdMap
    }yield {
      val roles=userRoles.map{userRoleObj=>
        val roleName:String=roleIdMap(userRoleObj._2.get.roleId.get).roleName
        RoleType.withName(roleName)
      }
      UserInfo(id=user.id,userName=user.username,displayName = user.displayname,roles=roles,active = user.active)
    }
  }

  private def getUserDetailInternal(userName:String)={
    val query=for{
      (user, userRole) <- Users.filter(_.username===userName) joinLeft  UserRoles on (_.id === _.userId)
    }yield {
      (user,userRole)
    }
    val roleIdMap=rolesUtil.getRoleIdMap
    db.run(query.result).map { results =>
      val user:User=results.head._1
      var roles=results.filter(res=>res._2.isDefined )
      (user,roles)
    }
  }

  def insert(username: String, password: String, displayname: String, avatar: Option[String]): Future[User] = {
    //    TODO: generate avatar url from username > gravatar?
    val user = User(username = username, password = password, displayname = displayname, avatar = avatar,active = Some(true))
    db.run {
      Users returning Users += user
    }
  }

  def updateActiveAndRoles(userInfo:UserInfo)={
    for{
      (user,userRoles)<-getUserDetailInternal(userInfo.userName)
      userRoles<-db.run(UserRoles.filter(_.userId === user.id.get).result)
      (toBeAddedRoleIds,toBeDeletedRoleIds)<-resolveUserRolesEntries(userInfo.roles,userRoles)

    }yield{
      val userRoleObjs=rolesUtil.getUserRoleObjectsforRoleIds(user.id.get,toBeAddedRoleIds)
      val query =for{
        updateActive <- getUpdateActiveQuery(userInfo)
        insertQuery<-UserRoles returning UserRoles ++= userRoleObjs
        delQuery <- UserRoles.filter(_.roleId inSet toBeDeletedRoleIds).delete
      }yield {
        (updateActive,delQuery,insertQuery)
      }
      db.run(query.transactionally)
    }
  }

  def insertUserWithRoles(userInfo:UserInfo,password:String)={
    val user = User(username = userInfo.userName, password = password, displayname = userInfo.displayName,avatar = None,active = userInfo.active)
    rolesUtil.getRoleNameMap().flatMap{roleNameMap=>
      val query = for{
        user <- Users returning Users += user
        userRoles <-{
          val userRoleObjs=rolesUtil.getUserRoleObjects(user.id.get,userInfo.roles,roleNameMap)
          UserRoles returning UserRoles ++= userRoleObjs
        }
      }yield {
        (user,userRoles)
      }
      db.run(query.transactionally).map(res=>userInfo)
    }
  }
  private def getUpdateActiveQuery(userInfo:UserInfo)={
    Users.filter(_.username===userInfo.userName)
      .map{r=>
        (r.active,r.updated)
      }
      .update(userInfo.active, Some(LocalDateTime.now()))
  }


  private def resolveUserRolesEntries(roles: Seq[RoleType.Value], userRoles: Seq[UserRole]):Future[(Seq[Long],Seq[Long])] = {
    rolesUtil.getRoleNameMap().map{ roleNameMap=>
      val requiredRoleIds:Seq[Long]=roles.map(roleType=>roleNameMap(roleType.toString).id.get)
      val existingRoleIds:Seq[Long]=userRoles.map(userRole=>userRole.roleId.get)
      val toBeAdded=requiredRoleIds.filterNot(existingRoleIds.contains(_))
      val toBeDeleted=existingRoleIds.filterNot(requiredRoleIds.contains(_))
      (toBeAdded,toBeDeleted)
    }
  }

  def deleteByUserId(userId: Long): Future[Int] = {
    db.run(Users.filter(_.id === userId).delete)
  }

  def findByName(username: String):Future[Option[User]] = {
    db.run(Users.filter(_.username === username).result.headOption)
  }

  def findById(userId: Long):Future[Option[User]] = {
    db.run(Users.filter(_.id === userId).result.headOption)
  }

  def getRolesForUser(userName: String): Future[UserRoles] = {
    val query = for {
      users <- Users if users.username === userName
      roles <- roleRepo.Roles
      userRoles <- UserRoles if roles.id === userRoles.roleId if users.id === userRoles.userId
    } yield (roles.roleName)

    val result = db.run(query.result)
    result.map(r => com.hortonworks.dataplane.commons.domain.Entities.UserRoles(userName, r))
  }

  def addUserRole(userRole: UserRole): Future[UserRole] = {
    db.run {
      UserRoles returning UserRoles += userRole
    }
  }

  final class UsersTable(tag: Tag) extends Table[User](tag, Some("dataplane"), "users") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def username = column[String]("user_name")

    def password = column[String]("password")

    def displayname = column[String]("display_name")

    def avatar = column[Option[String]]("avatar")

    def active = column[Option[Boolean]]("active")

    def created = column[Option[LocalDateTime]]("created")
    def updated = column[Option[LocalDateTime]]("updated")

    def * = (id, username, password, displayname, avatar, active, created, updated) <> ((User.apply _).tupled, User.unapply)
  }

  final class UserRolesTable(tag: Tag) extends Table[(UserRole)](tag, Some("dataplane"), "users_roles") {
    def id = column[Option[Long]]("id", O.PrimaryKey, O.AutoInc)

    def userId = column[Option[Long]]("user_id")

    def roleId = column[Option[Long]]("role_id")

    def user = foreignKey("user_userRole", userId, Users)(_.id)

    def role = foreignKey("role_userRole", roleId, roleRepo.Roles)(_.id)

    def * = (id, userId, roleId) <> ((UserRole.apply _).tupled, UserRole.unapply)

  }

}
