package com.hortonworks.datapalane.consul;

import java.util.Random;

public class RandomGenerator {
  private static char[] _base62chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".toCharArray();
  private static Random _random = new Random();
  int stringLength;

  public RandomGenerator(int stringLength) {
    this.stringLength = stringLength;
  }

  public String generate() {
    StringBuilder sb = new StringBuilder(stringLength);
    for (int i = 0; i < stringLength; i++) {
      sb.append(_base62chars[_random.nextInt(62)]);
    }
    return sb.toString();
  }
}
