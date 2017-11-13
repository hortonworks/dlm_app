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

import {ClusterAddPage} from "./infra/clusters/cluster-add.po";
import {browser} from "protractor";
import {SignInPage} from "./core/sign-in.po";

export class SetUp {
  static clusterAddPage = new ClusterAddPage();

  static async signIn(){
    await browser.sleep(1000); //Increase it if knox opens
    let loginPage = await SignInPage.get();
    await loginPage.justSignIn();
    await browser.sleep(1000); // its needed for now. else knox page opens and that throws error. Increase it if knox opens
  }
}
