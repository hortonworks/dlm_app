package utils

import java.net.URLEncoder

object StringExtensions {
  implicit class urlEncodedString(url: String) {
    def encode = URLEncoder.encode(url, "utf-8")
  }
}
