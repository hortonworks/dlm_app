/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var loginPageSuffix = "/knoxauth/login.html";
var webssoURL = "/api/v1/websso?originalUrl=";
var userAgent = navigator.userAgent.toLowerCase();

$(document).ready(function () {
    var originalUrl = get("originalUrl");
    $.get(originalUrl+"/api/ga/properties", function (res) {
        if(res.enabled === true){
            $("#tracking-message").html("Hortonworks DataPlane Service uses cookies and other telemetry mechanisms to improve the product and your experience. By logging in, you give consent to Hortonworks to use cookies. To learn more, please review our <a href='https://hortonworks.com/privacy-policy/' target='_blank'>Privacy Policy</a>");
        }else{
            $("#tracking-message").html("")
        }
    });
});

function get(name){
    //KNOX-820 changing the regex so that multiple query params get included with the 'originalUrl'
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}

function testSameOrigin(url) {
    var loc = window.location,
        a = document.createElement('a');
    a.href = url;
    return a.hostname == loc.hostname &&
        a.port == loc.port &&
        a.protocol == loc.protocol;
}

function redirect(redirectUrl) {
    try { window.location.replace(redirectUrl); }
    catch(e) { window.location = redirectUrl; }
}

var keypressed = function(event) {
    if (event.keyCode == 13) {
        login();
    }
}

var login = function() {
    var pathname = window.location.pathname;
    var topologyContext = pathname.replace(loginPageSuffix, "");;
    var loginURL = topologyContext + webssoURL;
    var form = document.forms[0];
    var username = form.username.value;
    var password = form.password.value;
    var _login = function() {
        var originalUrl = get("originalUrl");
        var idpUrl = loginURL + originalUrl;
        var redirectUrl = originalUrl;
        //Instantiate HTTP Request
        var request = ((window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
        request.open("POST", idpUrl, true);
        request.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password))
        request.send(null);

        //Process Response
        request.onreadystatechange = function(){
            if (request.readyState == 4) {
                if (request.status==0 || request.status==200 || request.status==204 || request.status==307 || request.status==303) {
                    if (testSameOrigin(originalUrl) == false) {
                        redirectUrl = "redirecting.html?originalUrl=" + originalUrl;
                    }
                    redirect(redirectUrl);
                }
                else {
                    if (request.status==401) {
                        $('#errorBox').show();
                        $('#signInLoading').hide();
                        $('#signIn').removeAttr('disabled');
                        $('#errorBox .errorMsg').text("The username or password you entered is incorrect.");
                    }
                }
            }
        }
    }

    _login();
}