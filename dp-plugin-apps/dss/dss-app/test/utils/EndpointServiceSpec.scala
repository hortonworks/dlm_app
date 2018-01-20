package utils

import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, DataplaneCluster}
import com.hortonworks.dataplane.cs.Webservice.AmbariWebService
import com.hortonworks.dataplane.db.Webservice.{ClusterService, DpClusterService}
import com.hortonworks.dlm.beacon.domain.RequestEntities.RangerServiceDetails
import org.scalatest.mock.MockitoSugar
import org.scalatestplus.play.{OneAppPerTest, PlaySpec}
import org.mockito.Mockito._
import org.scalatest.concurrent.AsyncAssertions

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global


class EndpointServiceSpec extends PlaySpec with MockitoSugar with OneAppPerTest{

  "Endpoint Service" must {

    val aws = mock[AmbariWebService]
    val cs = mock[ClusterService]
    val dpc = mock[DpClusterService]

    when(aws.isSingleNode) thenReturn Future.successful(true)
    when(cs.retrieve("1")) thenReturn Future.successful(
      Right(
        Cluster(id = Some(1), name = "test", dataplaneClusterId = Some(1))))
    when(dpc.retrieve("1")) thenReturn Future.successful(
      Right(DataplaneCluster(
        id = Some(1),
        name = "test",
        dcName = "",
        description = "",
        ambariUrl = "http://10.0.0.0:8080",
        ambariIpAddress = "",
        location = Some(1),
        createdBy = Some(1),
        state = Some("TO_SYNC"),
        knoxUrl = None,
        properties = None
      )))

    val service = new EndpointService(aws, cs, dpc)


    "transfom Hdfs datamap" in {

      service.transFormHdfsData(Map("fsEndpoint" -> Some("hdfs://test.blah.asasew:87700"),"dfs.namenode.rpc-address.blah"->Some("abd.somehost.qqq-1:9000")),1).map { x =>
        x.foreach{ case (k,v) =>
          v.isDefined mustBe true
          v.get.matches("10.0.0.0:\\d+") mustBe true
        }

      }

    }

    "transform Hive Quorum" in {
      service.transformZKQuorum("abd.somehost.qqq-1:9000,abd.somehost.qqq-2:9001",1).map { x =>
        x mustBe "10.0.0.0:9000,10.0.0.0:9001"
      }
    }


    "transform Ranger Data" in {
      service.transformRangerData(RangerServiceDetails("http://ranger:6080","test",Some("test")),1).map { x =>
          x.rangerEndPoint mustBe  "http://10.0.0.0:6080"
      }
    }


  }

}
