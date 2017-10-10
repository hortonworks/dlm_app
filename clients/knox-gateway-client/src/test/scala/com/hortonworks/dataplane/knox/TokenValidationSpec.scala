package com.hortonworks.dataplane.knox

import com.hortonworks.dataplane.knox.Knox.TokenResponse
import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.json.Json

class TokenValidationSpec extends FlatSpec with Matchers {

  "Token Parser" should "parse a valid token with all fields" in {

    val token = """{"access_token":"eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbjEiLCJpc3MiOiJLTk9YU1NPIiwiZXhwIjoxNTA3NjE4OTczfQ.CokjgkVnKR_lLCzTmB9LWvZjtRzKOXlwRySXA7zwuRtVuWXj7oMCrnpVZ0eWCzvlusZTG1KebZS06VYRC_t85PbVUTS_DKpQdvECb58nccUDiPQkrF62A-8T972FhhhV8GZDOJ5mwzzAmqmzmwpjhIKtZq2FLwBDMzyTlNqY6GM","cookie.name":"hadoop-jwt","target_url":"https://ctr-e134-1499953498516-209927-01-000005.hwx.site:8443/gateway/tokenbased","token_type":"Bearer ","expires_in":1507618973524}"""

    import Knox.TokenResponse._

    Json.parse(token).validate[TokenResponse].map { t =>
      assert(t.targetUrl.get == "https://ctr-e134-1499953498516-209927-01-000005.hwx.site:8443/gateway/tokenbased")
    }.getOrElse {
      fail()
    }
  }

  it should "parse null fields into an Option type" in {

    val token = """{"access_token":"eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbjEiLCJpc3MiOiJLTk9YU1NPIiwiZXhwIjoxNTA3NjE4NDEzfQ.O_8wD7f4Y08JxSv5DuWSjK8rIK3Zhep_oHTXj2huaLiCw_oohMUTbedw_hBU5qvFbbAWMVPD0AM2w3Q5PrJDESmxER8WR-FlrnwfLSH_8-CLZiTgHy8cyZ3jB7QsnJns839WhE7M5u4V7GnQys5cScgtF3GG8gE8j29rarzKVTE","cookie.name":"hadoop-jwt","token_type":"Bearer ","expires_in":1507618413641}"""


    import Knox.TokenResponse._

    Json.parse(token).validate[TokenResponse].map { t =>
      assert(t.targetUrl.isEmpty)
      assert(t.tokenType.get == "Bearer ")
      assert(t.expires == 1507618413641L)
    }.getOrElse {
      fail()
    }

  }




}
