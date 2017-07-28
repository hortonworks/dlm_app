package com.hortonworks.dataplane.gateway.service;

import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.User;
import com.hortonworks.dataplane.gateway.domain.UserList;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.domain.UserRoleResponse;
import com.hortonworks.dataplane.gateway.utils.Utils;
import feign.FeignException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

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
      throw new RuntimeException(fe);
    }
  }
}
