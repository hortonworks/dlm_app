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


import com.hortonworks.dataplane.gateway.domain.BlacklistedToken;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class BlacklistedTokenService {
    private static final Logger logger = LoggerFactory.getLogger(BlacklistedTokenService.class);

    private ExecutorService executor = Executors.newSingleThreadExecutor();

    @Autowired
    private BlacklistedTokenServiceInterface blacklistedTokenServiceInterface;

    public boolean isBlacklisted(String token) {
      try {
        return (blacklistedTokenServiceInterface.getToken(token) != null);
      } catch (FeignException ex) {
        return false;
      }
    }

    public void insert(String token, LocalDateTime expiry) {
      logger.debug("Blacklisting token: " + token);
      executor.submit(() -> {
        try {
          blacklistedTokenServiceInterface.insert(new BlacklistedToken(token, expiry));
        } catch (Exception ex) {
          logger.error("Failed to blacklist token", ex);
        }
      });
    }
}
