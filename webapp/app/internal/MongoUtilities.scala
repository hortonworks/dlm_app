package internal

import play.api.libs.json.JsObject
import reactivemongo.api.commands.{WriteError, WriteResult}


trait MongoUtilities {

  def extractWriteError(res: WriteResult): String = {
    val errors: Seq[String] = res.writeErrors.collect { case we: WriteError => we.errmsg }
    val errorString: String = errors.mkString(",")
    errorString
  }


}
