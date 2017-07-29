package com.hortonworks.dataplane.gateway.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.*;
import com.hortonworks.dataplane.gateway.utils.Utils;
import com.netflix.zuul.context.RequestContext;
import feign.FeignException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class UserService {
  @Autowired
  private Utils utils;
  @Autowired
  private UserServiceInterface userServiceInterface;

  @Autowired
  private LdapUserInterface ldapUserInterface;


  public Optional<UserContext> getUserContext(String userName) {
    try {
      UserList list=userServiceInterface.getUserContext(userName);
      return Optional.of(list.getResults());
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
      return ldapUserInterface.addUserFromLdapGroupsConfiguration(subject);
    }catch (FeignException fe){
      if (fe.status()==403){
        throw new NoAllowedGroupsException();//Usaually groups are not configured for this user.
      }else{
        throw fe;
      }
    }
  }
}
