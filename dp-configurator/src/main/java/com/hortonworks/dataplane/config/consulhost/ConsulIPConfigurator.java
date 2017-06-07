package com.hortonworks.dataplane.config.consulhost;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Scanner;

import org.apache.commons.validator.routines.InetAddressValidator;


public class ConsulIPConfigurator {
  public static void main(String args[]) throws Exception {
    List<InetAddress> privateIps = getPrivateIps();
    displayIPOptions(privateIps);
    String selectedIp = selectIp(privateIps);
    System.out.println("your selected ip is" + selectedIp);
  }

  private static void displayIPOptions(List<InetAddress> privateIps) {
    int i = 1;
    for (InetAddress ia : privateIps) {
      System.out.println(String.format("%d)  %s", i++, ia.getHostAddress()));
    }
  }

  private static String selectIp(List<InetAddress> privateIps) {
    System.out.println("Enter the ip address to select or enter 0 for custom");
    Scanner scanner = new Scanner(System.in);
    int option = scanner.nextInt();
    String selectedIp = null;
    if (option == 0) {
      System.out.println("Enter your ip");
      boolean isValidIp = false;
      while (!isValidIp) {
        String ip = scanner.next();
        isValidIp = InetAddressValidator.getInstance().isValid(ip);
        if (!isValidIp) {
          System.out.println("Invalid ip.Try again");
        } else {
          selectedIp = ip;
        }
      }
    } else {
      selectedIp = privateIps.get(option + 1).getHostAddress();
    }
    return selectedIp;
  }

  private static List<InetAddress> getPrivateIps() throws SocketException {
    ArrayList<InetAddress> privateIps = new ArrayList<>();
    Enumeration<NetworkInterface> e = NetworkInterface.getNetworkInterfaces();
    while (e.hasMoreElements()) {
      NetworkInterface networkInterface = (NetworkInterface) e.nextElement();
      Enumeration ee = networkInterface.getInetAddresses();
      while (ee.hasMoreElements()) {
        InetAddress inetAddress = (InetAddress) ee.nextElement();
        if (inetAddress.isSiteLocalAddress()) {
          privateIps.add(inetAddress);
        }
      }
    }
    return privateIps;
  }
}