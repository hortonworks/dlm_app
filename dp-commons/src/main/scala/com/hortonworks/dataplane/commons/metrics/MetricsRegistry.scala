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

package com.hortonworks.dataplane.commons.metrics

import com.codahale.metrics.MetricRegistry.MetricSupplier
import com.codahale.metrics.{Gauge, JmxReporter, MetricRegistry}
import io.prometheus.client.CollectorRegistry
import io.prometheus.client.dropwizard.DropwizardExports

import scala.collection.JavaConverters._

class MetricsRegistry(private val name:String) {

  private[metrics] val registry =  new MetricRegistry()

  CollectorRegistry.defaultRegistry.register(new DropwizardExports(registry))

  private val clientId = Option(System.getenv("DP_METRICS_CLIENT_ID")).getOrElse("defaultClientId")

  private val gc = s"$clientId.$name.gc"

  private val buffers = s"$clientId.$name.buffers"

  private val memory = s"$clientId.$name.memory"

  private val threads = s"$clientId.$name.threads"

  def intJVMMetrics = {
    import java.lang.management.ManagementFactory

    import com.codahale.metrics.jvm.{BufferPoolMetricSet, GarbageCollectorMetricSet, MemoryUsageGaugeSet, ThreadStatesGaugeSet}

    registerMetricSet(gc, new GarbageCollectorMetricSet, registry)
    registerMetricSet(buffers, new BufferPoolMetricSet(ManagementFactory.getPlatformMBeanServer), registry)
    registerMetricSet(memory, new MemoryUsageGaugeSet, registry)
    registerMetricSet(threads, new ThreadStatesGaugeSet, registry)

    //Set up the JMX reporter
    val reporter = JmxReporter.forRegistry(registry).build
    reporter.start()
  }

  import com.codahale.metrics.{MetricRegistry, MetricSet}

  private def registerMetricSet(prefix: String, metricSet: MetricSet, registry: MetricRegistry):Unit = {
    import scala.collection.JavaConversions._
    metricSet.getMetrics.entrySet.asScala.foreach(entry => entry.getValue match {
      case set: MetricSet => registerMetricSet(s"$prefix.${entry.getKey}", set, registry)
      case _ => registry.register(s"$prefix.${entry.getKey}", entry.getValue)
    })
  }

  intJVMMetrics


  def newMeter(meterName:String) = {
    registry.meter(s"$clientId.$name.$meterName")
  }


  def newTimer(timerName:String) = {
    registry.timer(s"$clientId.$name.$timerName")
  }


  def newGauge[T](gaugeName:String,f: () => T): Unit = {
    registry.gauge(s"$clientId.$name.$gaugeName",new MetricSupplier[Gauge[_]](){
      override def newMetric(): Gauge[T] = new Gauge[T]{
        override def getValue: T = f()
      }
    })
  }


  def counter(counterName:String) = {
    registry.counter(s"$clientId.$name.$counterName")
  }

}

object MetricsRegistry {
  def apply(name:String): MetricsRegistry = new MetricsRegistry(name)
}
