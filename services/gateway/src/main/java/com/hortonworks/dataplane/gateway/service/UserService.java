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

  private ObjectMapper objectMapper = new ObjectMapper();

  public Optional<User> getUser(String userName) {
    try {
      UserList userList = userServiceInterface.getUser(userName);
      if (userList == null || userList.getResults().size() < 1) {
        return Optional.absent();
      } else {
        return Optional.of(userList.getResults().get(0));
      }
    } catch (FeignException e) {
      if (e.status() == HttpStatus.NOT_FOUND.value()) {
        //USer is not found
        return Optional.absent();
      } else {
        throw new RuntimeException(e);
      }
    }
  }

  public Optional<UserContext> getUserContext(String userName) {
    Optional<User> user = getUser(userName);
    if (user.isPresent()) {
      List<String> roles = getRoles(userName);
      return Optional.of(getUserContext(user.get(), roles, null));
    } else {
      return Optional.absent();
    }
  }
  public UserContext getUserContext(User user) {
    List<String> roles = getRoles(user.getUsername());
    return getUserContext(user, roles, null);
  }

  public List<String> getRoles(String userName) {
    try {
      UserRoleResponse rolesResponse = userServiceInterface.getRoles(userName);
      return rolesResponse.getResults().getRoles();
    } catch (FeignException e) {
      if (e.status() == HttpStatus.NOT_FOUND.value()) {
        //USer is not found
        throw new RuntimeException("User not found");
      } else {
        throw new RuntimeException(e);
      }
    }
  }

  public UserContext getUserContext(User user, List<String> roles, String token) {
    UserContext userContext = new UserContext();
    userContext.setId(user.getId());//TODO currently id is username. check later
    userContext.setUsername(user.getUsername());
    userContext.setAvatar(user.getAvatar());
    userContext.setDisplay(user.getDisplayname());
    try {
      userContext.setRoles(roles);
    } catch (Throwable th) {
      userContext.setRoles(new ArrayList<String>());
    }
    userContext.setToken(token);
    return userContext;
  }
  public UserContext syncUserFromLdapGroupsConfiguration(String subject) {
    try {
      return ldapUserInterface.addUserFromLdapGroupsConfiguration(subject);
    }catch (FeignException fe){
      String responseContent=null;
      String message=fe.getMessage();
      int contentIdx=message.indexOf("content:");
      if (contentIdx>-1){
        responseContent=message.substring(contentIdx+9);
        try {
          DpErrors dpErrors = objectMapper.readValue(responseContent, DpErrors.class);
          if (dpErrors.hasErrors() && dpErrors.getFirstError().getMessage()!=null &&
            dpErrors.getFirstError().getMessage().startsWith("NO_ALLOWED_GROUPS")){
            throw new NoAllowedGroupsException();
          }else{
            throw fe;
          }
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
      }else{
        throw fe;
      }
    }
  }
}
