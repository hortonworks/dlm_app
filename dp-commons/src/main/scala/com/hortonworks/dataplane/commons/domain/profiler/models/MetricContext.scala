/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package com.hortonworks.dataplane.commons.domain.profiler.models

import com.hortonworks.dataplane.commons.domain.profiler.models.MetricContext.MetricContextType.MetricContextType

object MetricContext {

  trait MetricContextDefinition

  object MetricContextType extends Enumeration {
    type MetricContextType = Value
    val CLUSTER, COLLECTION, ASSET = Value
  }

  case class CollectionContext(collectionId: String) extends MetricContextDefinition

  case object ClusterContext extends MetricContextDefinition


  case class ProfilerMetricContext(contextType: MetricContextType, definition: MetricContextDefinition)

}
