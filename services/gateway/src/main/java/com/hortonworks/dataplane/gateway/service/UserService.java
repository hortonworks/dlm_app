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
package com.hortonworks.dataplane.gateway.service;

import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.*;
import feign.FeignException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserService {
  @Autowired
  private UserServiceInterface userServiceInterface;

  @Autowired
  private LdapUserInterface ldapUserInterface;


  public Optional<UserContext> getUserContext(String userName) {
    try {
      UserList list=userServiceInterface.getUserContext(userName);
      UserContext uc = list.getResults();
      uc.setDbManaged(false);
      return Optional.of(uc);
    }catch (FeignException fe){
      if (fe.status()==404){
        return Optional.absent();
      }else{
        throw fe;
      }
    }
  }


  public UserContext syncUserFromLdapGroupsConfiguration(String subject) {
    try {
      UserContext uc = ldapUserInterface.addUserFromLdapGroupsConfiguration(subject);
      uc.setDbManaged(false);
      return uc;
    }catch (FeignException fe){
      if (fe.status()==403){
        throw new NoAllowedGroupsException();//Usaually groups are not configured for this user.
      }else{
        throw fe;
      }
    }
  }
  public UserContext resyncUserFromLdapGroupsConfiguration(String subject) {
    try {
      UserContext uc = ldapUserInterface.resyncUserFromLdapGroupsConfiguration(subject);
      uc.setDbManaged(false);
      return uc;
    }catch (FeignException fe){
      if (fe.status()==403){
        throw new NoAllowedGroupsException();//Usaually groups are not configured for this user.
      }else{
        throw fe;
      }
    }
  }

}
