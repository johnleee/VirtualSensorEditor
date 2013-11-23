<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:output method="xml" indent="yes" encoding="UTF-8"/>
  <xsl:template match="/">
    <workflow xmlns="http://taverna.sf.net/2008/xml/t2flow" version="1" producedBy="CMUSV">
      <xsl:for-each select="ROOT/VIRTUAL_SENSORS/*">
        <dataflow>
          <xsl:attribute name="id">
            <xsl:value-of select="source"/>
          </xsl:attribute>
          <xsl:attribute name="role">top</xsl:attribute>
          <xsl:variable name="uuid" select="source"/>
          <name>
            <xsl:value-of select="name"/>
          </name>
          <inputPorts>
            <xsl:for-each select="components/value/children">
              <xsl:variable name="childUuid" select="text()"/>
              <port>
                <name>
                  <xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/>
                </name>
                <depth>0</depth>
                <!-- TODO: hard coded to 0 for now -->
                <granularDepth>0</granularDepth>
                <!-- TODO: hard coded to 0 for now -->
              </port>
            </xsl:for-each>
          </inputPorts>
          <outputPorts>
            <port>
              <name>
                <xsl:value-of select="name"/>
              </name>
              <annotations/>
            </port>
          </outputPorts>
          <processors>
            <processor>
              <name>
                <xsl:value-of select="components/value/name"/>
              </name>
              <inputPorts>
                <xsl:for-each select="components/value/children">
                  <xsl:variable name="childUuid" select="text()"/>
                  <port>
                    <name>
                      <xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/>
                    </name>
                    <depth>0</depth>
                    <!-- TODO: hard coded for now -->
                  </port>
                </xsl:for-each>
              </inputPorts>
              <outputPorts>
                <port>
                  <name>
                    <xsl:value-of select="components/value/name"/>
                  </name>
                  <depth>0</depth>
                  <!-- TODO: hard coded for now -->
                  <granularDepth>0</granularDepth>
                  <!-- TODO: hard coded to 0 for now -->
                </port>
              </outputPorts>
              <annotations/>
              <activities>
                <activity>
                  <raven>
                    <group>net.sf.taverna.t2.activities</group>
                    <artifact>localworker-activity</artifact>
                    <version>1.4</version>
                  </raven>
                  <class>
net.sf.taverna.t2.activities.localworker.LocalworkerActivity
</class>
                  <inputMap>
                  	<xsl:for-each select="components/value/children">
										<xsl:variable name="childUuid" select="text()"/>
                    <map>
												<xsl:attribute name="from">
													<xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/>
												</xsl:attribute>
												<xsl:attribute name="to">
													<xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/>
												</xsl:attribute>
          					</map>
										</xsl:for-each>
                  </inputMap>
                  <outputMap>
                    <map>
                    	<xsl:attribute name="from">
                    		<xsl:value-of select="components/value/name"/>
                    	</xsl:attribute>
                    	<xsl:attribute name="to">
                    		<xsl:value-of select="components/value/name"/>
                    	</xsl:attribute>
                    </map>
                  </outputMap>
                  <configBean encoding="xstream">
                    <net.sf.taverna.t2.activities.localworker.LocalworkerActivityConfigurationBean xmlns="">
                      <inputs>
                      	<xsl:for-each select="components/value/children">
												<xsl:variable name="childUuid" select="text()"/>
                        <net.sf.taverna.t2.workflowmodel.processor.activity.config.ActivityInputPortDefinitionBean>
                          <name><xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/></name>
                          <depth>0</depth>
                          <mimeTypes>
                            <string>'text/plain'</string>
                          </mimeTypes>
                          <handledReferenceSchemes/>
                          <translatedElementType>java.lang.String</translatedElementType>
                          <allowsLiteralValues>true</allowsLiteralValues>
                        </net.sf.taverna.t2.workflowmodel.processor.activity.config.ActivityInputPortDefinitionBean>
                        </xsl:for-each>
                      </inputs>
                      <outputs>
                        <net.sf.taverna.t2.workflowmodel.processor.activity.config.ActivityOutputPortDefinitionBean>
                          <name><xsl:value-of select="components/value/name"/></name>
                          <depth>0</depth>
                          <mimeTypes>
                            <string>'text/plain'</string>
                          </mimeTypes>
                          <granularDepth>0</granularDepth>
                        </net.sf.taverna.t2.workflowmodel.processor.activity.config.ActivityOutputPortDefinitionBean>
                      </outputs>
                      <classLoaderSharing>workflow</classLoaderSharing>
                      <localDependencies/>
                      <artifactDependencies/>
                      <script><xsl:value-of select="components/value/name"/> = Integer.parseInt(<xsl:value-of select="components[2]/value/name"/>) + Integer.parseInt(<xsl:value-of select="components[3]/value/name"/>);</script>
                      <dependencies/>
                      <localworkerName>ru.iitp.cluster.taverna.Localworker</localworkerName>
                    </net.sf.taverna.t2.activities.localworker.LocalworkerActivityConfigurationBean>
                  </configBean>
                  <annotations/>
                </activity>
              </activities>
              <dispatchStack>
                <dispatchLayer>
                  <raven>
                    <group>net.sf.taverna.t2.core</group>
                    <artifact>workflowmodel-impl</artifact>
                    <version>1.4</version>
                  </raven>
                  <class>
net.sf.taverna.t2.workflowmodel.processor.dispatch.layers.Parallelize
</class>
                  <configBean encoding="xstream">
                    <net.sf.taverna.t2.workflowmodel.processor.dispatch.layers.ParallelizeConfig xmlns="">
                      <maxJobs>1</maxJobs>
                    </net.sf.taverna.t2.workflowmodel.processor.dispatch.layers.ParallelizeConfig>
                  </configBean>
                </dispatchLayer>
                <dispatchLayer>
                  <raven>
                    <group>net.sf.taverna.t2.core</group>
                    <artifact>workflowmodel-impl</artifact>
                    <version>1.4</version>
                  </raven>
                  <class>
net.sf.taverna.t2.workflowmodel.processor.dispatch.layers.ErrorBounce
</class>
                  <configBean encoding="xstream">
                    <null xmlns=""/>
                  </configBean>
                </dispatchLayer>
                <dispatchLayer>
                  <raven>
                    <group>net.sf.taverna.t2.core</group>
                    <artifact>workflowmodel-impl</artifact>
                    <version>1.4</version>
                  </raven>
                  <class>
net.sf.taverna.t2.workflowmodel.processor.dispatch.layers.Failover
</class>
                  <configBean encoding="xstream">
                    <null xmlns=""/>
                  </configBean>
                </dispatchLayer>
                <dispatchLayer>
                  <raven>
                    <group>net.sf.taverna.t2.core</group>
                    <artifact>workflowmodel-impl</artifact>
                    <version>1.4</version>
                  </raven>
                  <class>
net.sf.taverna.t2.workflowmodel.processor.dispatch.layers.Retry
</class>
                  <configBean encoding="xstream">
                    <net.sf.taverna.t2.workflowmodel.processor.dispatch.layers.RetryConfig xmlns="">
                      <backoffFactor>1</backoffFactor>
                      <initialDelay>1000</initialDelay>
                      <maxDelay>5000</maxDelay>
                      <maxRetries>0</maxRetries>
                    </net.sf.taverna.t2.workflowmodel.processor.dispatch.layers.RetryConfig>
                  </configBean>
                </dispatchLayer>
                <dispatchLayer>
                  <raven>
                    <group>net.sf.taverna.t2.core</group>
                    <artifact>workflowmodel-impl</artifact>
                    <version>1.4</version>
                  </raven>
                  <class>
net.sf.taverna.t2.workflowmodel.processor.dispatch.layers.Invoke
</class>
                  <configBean encoding="xstream">
                    <null xmlns=""/>
                  </configBean>
                </dispatchLayer>
              </dispatchStack>
              <iterationStrategyStack>
                <iteration>
                  <strategy>
                    <cross>
                    	<xsl:for-each select="components/value/children">
											<xsl:variable name="childUuid" select="text()"/>
                      <port>
                      	<xsl:attribute name="name">
                      		<xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/>
                      	</xsl:attribute>
                      	<xsl:attribute name="depth">0</xsl:attribute>
                      </port>
											</xsl:for-each>
                    </cross>
                  </strategy>
                </iteration>
              </iterationStrategyStack>
            </processor>
          </processors>
          <conditions/>
          <datalinks>
            <xsl:for-each select="components/value/children">
              <xsl:variable name="childUuid" select="text()"/>
              <datalink>
                <sink type="processor">
                  <processor>
                    <xsl:value-of select="../name"/>
                  </processor>
                  <port>
                    <xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/>
                  </port>
                </sink>
                <source type="dataflow">
                  <port>
                    <xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/>
                  </port>
                </source>
              </datalink>
            </xsl:for-each>
            <datalink>
              <sink type="dataflow">
                <port>
                  <xsl:value-of select="name"/>
                </port>
              </sink>
              <source type="processor">
                <processor>
                  <xsl:value-of select="components/value/name"/>
                </processor>
                <port>
                  <xsl:value-of select="components/value/name"/>
                </port>
              </source>
            </datalink>
          </datalinks>
          <annotations/>
        </dataflow>
      </xsl:for-each>
    </workflow>
  </xsl:template>
</xsl:stylesheet>
