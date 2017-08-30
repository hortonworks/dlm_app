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

package domain

import slick.ast.Ordering
import slick.lifted.{ColumnOrdered, Query, Rep}

case class PaginatedQuery(offset: Int, size: Int, sortQuery: Option[SortQuery] = None)

case class SortQuery(sortCol: String, order: String) {
  def ordering: Ordering =
    if (order == "asc") Ordering(Ordering.Asc) else Ordering(Ordering.Desc)
}

trait ColumnSelector {
  val select: Map[String, Rep[_]]
}

object PaginationSupport {

  implicit class PaginationQuery[A <: ColumnSelector, B, C[_]](query: Query[A, B, C]) {
    def paginate(pqo: Option[PaginatedQuery]): Query[A, B, C] = {
      pqo match {
        case Some(pq) => paginate(pq)
        case None => query
      }
    }

    def paginate(pq: PaginatedQuery): Query[A, B, C] = {
      val sortQuery = pq.sortQuery match {
        case Some(sq) =>
          query.sortBy(_.select(sq.sortCol))(ColumnOrdered(_, sq.ordering))
        case None => query
      }
      sortQuery.drop(pq.offset).take(pq.size)
    }
  }

}
