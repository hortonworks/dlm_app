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

package com.hortonworks.dataplane.commons.service.api

import java.nio.file._

import scala.collection.JavaConverters._

// derieved from:
// https://github.com/pathikrit/better-files#file-monitoring

trait FileMonitor {
  val root: Path                                  // starting file
  def start(): Unit                               // start the monitor
  def onChange(path: Path): Unit = {}                   // callback
  def onException(e: Throwable): Unit = {}              // handle errors e.g. a read error
  def stop(): Unit                                // stop the monitor
}

class ThreadFileMonitor(val root: Path) extends Thread with FileMonitor {
  setDaemon(true) // daemonize this thread
  setUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler {
    override def uncaughtException(thread: Thread, exception: Throwable) = onException(exception)
  })

  val service = root.getFileSystem.newWatchService()

  override def run() = Iterator.continually(service.take()).foreach(process)

  override def interrupt() = {
    println("stopping watch")
    service.close()
    super.interrupt()
  }

  override def start() = {
    watch(root.getParent)
    super.start()
  }

  protected[this] def watch(file: Path): Unit = {
    if (Files.isDirectory(file)) {
      file.register(service, StandardWatchEventKinds.ENTRY_CREATE, StandardWatchEventKinds.ENTRY_DELETE, StandardWatchEventKinds.ENTRY_MODIFY)
    }
  }

  protected[this] def process(key: WatchKey) = {
    key.pollEvents().asScala.foreach {
      case event: WatchEvent[Path @unchecked] => dispatch(event.kind(), event.context())
    }
    key.reset()
  }

  def dispatch(eventType: WatchEvent.Kind[Path], file: Path): Unit = onChange(file)
}
