package com.hortonworks.dataplane.knoxagent

import java.io.StringWriter
import javax.xml.parsers.{DocumentBuilder, DocumentBuilderFactory}
import javax.xml.transform.TransformerFactory
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult
import javax.xml.xpath.{XPath, XPathConstants, XPathFactory}

import org.w3c.dom.{Document, Element, Node, NodeList}

import scala.collection.mutable

object TopologyGenerator {
  val xPath: XPath = XPathFactory.newInstance().newXPath()
  private def findByRoleName(nodeList: NodeList,
                             roleName: String): Option[Node] = {
    var i = 0
    while (i < nodeList.getLength) {
      val node = nodeList.item(i)
      val roleNode = xPath.evaluate("role", node)
      if (roleNode.equals(roleName)) {
        return Some(node)
      }
      i = i + 1
    }
    None
  }

  def configure(config: KnoxConfig) = {

    val doc: Document = getSsoTemplateDoc

    val authParams = getAuthenticationParams(doc)

    replaceParamValue(authParams.get("main.ldapRealm.userDnTemplate").get,
                      config.userDnTemplate.get)
    replaceParamValue(authParams.get("main.ldapRealm.contextFactory.url").get,
                      config.ldapUrl.get)
    replaceParamValue(authParams.get("main.ldapRealm.contextFactory.url").get,
                      config.ldapUrl.get)

    val ssoServiceParams = getKnoxSsoServiceParams(doc)
    var ttlMilliSecs = config.signedTokenTtl match {
      case Some(ttlInMinutes) => ttlInMinutes * 60000
      case None => -1
    }
    replaceParamValue(ssoServiceParams.get("knoxsso.token.ttl").get,
                      ttlMilliSecs.toString)
    var httpsOnly = config.allowHttpsOnly match {
      case Some(httpsOnly) => httpsOnly
      case None => false
    }
    replaceParamValue(ssoServiceParams.get("knoxsso.cookie.secure.only").get,
                      httpsOnly.toString)

    val whiteListDomains = config.domains match {
      case Some(domains) => {
        if (domains.size>0) {
          domains.mkString("|").trim+"|"
        }else{
          ""
        }
      }
      case None => ""
    }
    val whitelistRegex="^https?:\\/\\/("+whiteListDomains+"dataplane|localhost|127.0.0.1|0:0:0:0:0:0:0:1|::1)(:[0-9])*.*$"
    replaceParamValue(ssoServiceParams.get("knoxsso.redirect.whitelist.regex").get,
      whitelistRegex)
    val transformerFactory = TransformerFactory.newInstance
    val transformer = transformerFactory.newTransformer
    val stringWriter: StringWriter = new StringWriter()
    transformer.transform(new DOMSource(doc), new StreamResult(stringWriter))
    stringWriter.toString
  }

  private def getKnoxSsoServiceParams(doc: Document) = {
    val services: NodeList = xPath
      .evaluate("/topology/service",
                doc.getDocumentElement(),
                XPathConstants.NODESET)
      .asInstanceOf[NodeList]
    val knoxSsoNode = findByRoleName(services, "KNOXSSO")
    val knoxSsoParamVals = getParamNodeMap(
      knoxSsoNode.get.asInstanceOf[Element])
    knoxSsoParamVals
  }

  private def getAuthenticationParams(doc: Document) = {
    val gatewayProviders: NodeList = xPath
      .evaluate("/topology/gateway/provider",
                doc.getDocumentElement(),
                XPathConstants.NODESET)
      .asInstanceOf[NodeList]
    val authenticationNode = findByRoleName(gatewayProviders, "authentication")
    val authParamVals = getParamNodeMap(
      authenticationNode.get.asInstanceOf[Element])
    authParamVals
  }

  private def getSsoTemplateDoc = {
    val ssoTopologyTemplateStream =
      getClass.getResourceAsStream("/knoxssotopology_template.xml")
    val docFactory: DocumentBuilderFactory =
      DocumentBuilderFactory.newInstance()
    val docBuilder: DocumentBuilder = docFactory.newDocumentBuilder()
    val doc: Document = docBuilder.parse(ssoTopologyTemplateStream)
    doc
  }

  private def replaceParamValue(node: Node, paramValue: String) {

    val paramNodeChildren = node.getChildNodes
    var i = 0
    while (i < paramNodeChildren.getLength) {
      {
        val item = paramNodeChildren.item(i)
        if (item.getNodeName.equals("value")) item.setTextContent(paramValue)
      }
      {
        i += 1; i - 1
      }
    }
  }
  private def getParamNodeMap(knoxSsoConfig: Element) = {
    val paramNodes = knoxSsoConfig.getElementsByTagName("param")
    val paramNameToNodesMap = new mutable.HashMap[String, Node]()

    var i = 0
    while (i < paramNodes.getLength) {
      {
        val paramNode = paramNodes.item(i)
        val paramProperties = paramNode.getChildNodes
        var j = 0
        while (j < paramProperties.getLength) {
          {
            val paramProperty = paramProperties.item(j)
            if (paramProperty.getNodeName.equals("name"))
              paramNameToNodesMap.put(paramProperty.getFirstChild.getNodeValue,
                                      paramNode)
          }
          {
            j += 1; j - 1
          }
        }
      }
      {
        i += 1; i - 1
      }
    }
    paramNameToNodesMap
  }

}
