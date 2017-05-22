package com.hortonworks.dataplane.config;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Optional;

public class KnoxSSOConfig {
    private static final int MAX_RETRIES = 1;

    class LdapProperties {

        final String url;
        final String userDNSearchTemplate;
        private final String bindDn;
        private final String passwd;

        LdapProperties(String ldapUrl, String ldapDNSearchTemplate, String bindDn, String passwd) {
            this.url = ldapUrl;
            this.userDNSearchTemplate = ldapDNSearchTemplate;
            this.bindDn = bindDn;
            this.passwd = passwd;
        }

        @Override
        public String toString() {
            return "LdapProperties{" +
                    "url='" + url + '\'' +
                    ", userDNSearchTemplate='" + userDNSearchTemplate + '\'' +
                    ", bindDn='" + bindDn + '\'' +
                    ", passwd='" + passwd + '\'' +
                    '}';
        }

        boolean validate() {
            try {
                Hashtable<String, String> env = new Hashtable<>();
                env.put("com.sun.jndi.ldap.read.timeout", "1000");
                env.put("com.sun.jndi.ldap.connect.timeout", "5000");
                env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
                env.put(Context.PROVIDER_URL, url);
                env.put(Context.SECURITY_AUTHENTICATION, "simple");
                env.put(Context.SECURITY_PRINCIPAL, bindDn);
                env.put(Context.SECURITY_CREDENTIALS, passwd);
                DirContext ctx = new InitialDirContext(env);
                ctx.close();
                return true;
            } catch (NamingException e) {
                e.printStackTrace();
                return false;
            }
        }
    }

    public static void main(String[] args) throws IOException, ParserConfigurationException, SAXException, TransformerException {
        if (args.length != 2) {
            printUsageAndExit();
        }
        int numRetries = 0;
        KnoxSSOConfig ldapTest = new KnoxSSOConfig();
        if (args[0].equals("--prod")) {
            LdapProperties ldapProperties = ldapTest.readConfiguration();
            while(!ldapProperties.validate() && numRetries < MAX_RETRIES) {
                System.out.println("Could not connect to LDAP URL " + ldapProperties.url + " with provided credentials. Enter the details again...");
                numRetries++;
                ldapProperties = ldapTest.readConfiguration();
            }
            if (numRetries < MAX_RETRIES) {
                System.out.println("Validated connecting to LDAP URL " + ldapProperties.url + " with credentials");
                configureKnox(Optional.of(ldapProperties), args[1]);
            } else {
                System.out.println("LDAP connection properties seem invalid. Please start again after checking them.");
            }
        } else {
            System.out.println("Setting up Knox to use test LDAP instance");
            configureKnox(Optional.empty(), args[1]);
        }
    }

    private static void printUsageAndExit() {
        System.out.println("Usage: java " + KnoxSSOConfig.class.getCanonicalName() + " --test|--prod <knox_sso_file>");
        System.exit(-1);
    }

    private static void configureKnox(Optional<LdapProperties> ldapPropertiesOptional, String knoxFileName) throws ParserConfigurationException, IOException, SAXException, TransformerException {
        DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
        File knoxSSOFile = new File(knoxFileName);
        Document knoxSsoConfig = documentBuilder.parse(knoxSSOFile);
        HashMap<String, Node> paramNamesToNodesMap = buildParamNodesMap(knoxSsoConfig);
        if (ldapPropertiesOptional.isPresent()) {
            LdapProperties ldapProperties = ldapPropertiesOptional.get();
            replaceParamValue(paramNamesToNodesMap, "main.ldapRealm.userDnTemplate", ldapProperties.userDNSearchTemplate);
            replaceParamValue(paramNamesToNodesMap, "main.ldapRealm.contextFactory.url", ldapProperties.url);
        }
        replaceParamValue(paramNamesToNodesMap, "knoxsso.cookie.secure.only", "false");
        replaceParamValue(paramNamesToNodesMap, "knoxsso.redirect.whitelist.regex", "^https?:\\/\\/(dataplane|localhost|127.0.0.1|0:0:0:0:0:0:0:1|::1)(:[0-9])*.*$");
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        DOMSource source = new DOMSource(knoxSsoConfig);
        StreamResult result = new StreamResult(getNewFile(knoxSSOFile));
        transformer.transform(source, result);
    }

    private static File getNewFile(File knoxSSOFile) {
        String name = knoxSSOFile.getName() + ".bak";
        File parentFile = knoxSSOFile.getParentFile();
        return new File(parentFile, name);
    }

    private static void replaceParamValue(HashMap<String, Node> paramNamesToNodesMap,
                                          String paramName, String paramValue) {
        Node node = paramNamesToNodesMap.get(paramName);
        System.out.println("Before: " + node.getTextContent());
        NodeList paramNodeChildren = node.getChildNodes();
        for (int i = 0; i < paramNodeChildren.getLength(); i++) {
            Node item = paramNodeChildren.item(i);
            if (item.getNodeName().equals("value")) {
                item.setTextContent(paramValue);
            }
        }
        System.out.println("After: " + node.getTextContent());
    }

    private static HashMap<String, Node> buildParamNodesMap(Document knoxSsoConfig) {
        NodeList paramNodes = knoxSsoConfig.getElementsByTagName("param");
        HashMap<String, Node> paramNameToNodesMap = new HashMap<>();
        for (int i = 0; i < paramNodes.getLength(); i++) {
            Node paramNode = paramNodes.item(i);
            NodeList paramProperties = paramNode.getChildNodes();
            for (int j = 0; j < paramProperties.getLength(); j++) {
                Node paramProperty = paramProperties.item(j);
                if (paramProperty.getNodeName().equals("name")) {
                    paramNameToNodesMap.put(paramProperty.getFirstChild().getNodeValue(), paramNode);
                }
            }
        }
        return paramNameToNodesMap;
    }

    private LdapProperties readConfiguration() throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String ldapUrl = readUserConfiguration("Enter LDAP Server Address", reader);
        String searchBase = readUserConfiguration("Enter search base for identifying users", reader);
        String userAttribute = readUserConfiguration("Enter attribute name used for user IDs in LDAP", reader);
        String adminUserName = readUserConfiguration("Enter the Administrator username", reader);
        Console console = System.console();
        String adminPassword = readPassword("Enter the Administrator password", console);
        String ldapDNSearchTemplate = String.format("%s={0},%s", userAttribute, searchBase);
        LdapProperties ldapProperties = new LdapProperties(ldapUrl, ldapDNSearchTemplate, adminUserName, adminPassword);
        System.out.println("LDAP Properties: " + ldapProperties);
        return ldapProperties;
    }

    private String readPassword(String label, Console console) {
        return new String(console.readPassword(label + ": "));
    }

    private String readUserConfiguration(String label, BufferedReader reader) throws IOException {
        System.out.print(label + ": ");
        return reader.readLine().trim();
    }
}
