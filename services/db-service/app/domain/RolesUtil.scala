package domain

import javax.inject.{Inject, Singleton}

import com.hortonworks.dataplane.commons.domain.Entities.{Role, UserRole}
import com.hortonworks.dataplane.commons.domain.RoleType

import scala.concurrent.ExecutionContext.Implicits.global
//TODO synchronize
@Singleton
class RolesUtil  @Inject()(roleRepo: RoleRepo) {
  import scala.collection.mutable
  private var roleNameMapOpt:Option[mutable.Map[String, Role]] =  None

  def getRoleNameMap()  :mutable.Map[String,Role]={
    //TODO caching..
    roleNameMapOpt match{
      case None =>{
        val roleMap=mutable.Map.empty[String,Role]
        roleRepo.all().map{ roles=>
          roles.foreach{role=>
            roleMap.put(role.roleName,role)
          }
        }
        roleNameMapOpt=Some(roleMap)
        roleMap
      }
      case Some(roleMap)=>roleMap
    }
  }

  def getRoleIdMap:mutable.Map[Long,Role]={
    val roleIdMap=mutable.Map.empty[Long,Role]
    getRoleNameMap().foreach { roleMapping =>
      roleIdMap.put(roleMapping._2.id.get,roleMapping._2)
    }
    roleIdMap
  }
  def getRoleTypesForRoleIds(roleIds:Seq[Long]):Seq[RoleType.Value]={
    val roleIdMap=getRoleIdMap
    roleIds.map ( roleid =>RoleType.withName(roleIdMap.get(roleid).get.roleName))
  }

  def getUserRoleObjectsforRoles(userId:Long,roles:Seq[RoleType.Value]):Seq[UserRole]= {
    var roleNameMap=getRoleNameMap()
    roles.map(role=>UserRole(userId=Some(userId),roleId = roleNameMap.get(role.toString).get.id))
  }
}
