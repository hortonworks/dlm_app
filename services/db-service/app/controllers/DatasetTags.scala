package controllers

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.DatasetTag
import domain.DatasetTagRepo
import play.api.mvc.Action

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class DatasetTags @Inject()(datasetTagRepo: DatasetTagRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

//  def create = Action.async(parse.json) { req =>
//    req.body
//      .validate[DatasetTag]
//      .map { dc =>
//        datasetCategoryRepo
//          .insert(dc)
//          .map { u =>
//            success(u)
//          }.recoverWith(apiError)
//      }
//      .getOrElse(Future.successful(BadRequest))
//  }

  def getTags(query: Option[String]) = Action.async {
    datasetTagRepo.getTags(query).map(success(_)).recoverWith(apiError)
  }
}