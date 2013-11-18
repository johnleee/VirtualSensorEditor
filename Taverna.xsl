<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

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
      <name><xsl:value-of select="name"/></name>
      <inputPorts>
        <xsl:for-each select="components/value/children">
          <xsl:variable name="childUuid" select="text()"/>
          <port>
            <name><xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/></name>
            <depth>0</depth><!-- TODO: hard coded to 0 for now -->
            <granularDepth>0</granularDepth><!-- TODO: hard coded to 0 for now -->
          </port>
        </xsl:for-each>
      </inputPorts>
      <outputPorts>
        <port>
          <name><xsl:value-of select="name"/></name>
          <annotations></annotations>
        </port>
      </outputPorts>
      <processors>
        <processor>
          <name><xsl:value-of select="components/value/name"/></name>
          <inputPorts>
            <xsl:for-each select="components/value/children">
              <xsl:variable name="childUuid" select="text()"/>
              <port>
                <name><xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/></name>
                <depth>0</depth><!-- TODO: hard coded for now -->
              </port>
            </xsl:for-each>
          </inputPorts>
          <outputPorts>
            <port>
              <name><xsl:value-of select="components/value/name"/></name>
              <depth>0</depth><!-- TODO: hard coded for now -->
              <granularDepth>0</granularDepth><!-- TODO: hard coded to 0 for now -->
            </port>
          </outputPorts>
          <annotations></annotations>
          <activities></activities>
          <dispatchStack></dispatchStack>
          <iterationStrategyStack>
            <iteration>
              <strategy></strategy>
            </iteration>
          </iterationStrategyStack>
        </processor>
      </processors>
      <conditions></conditions>
      <datalinks>
        <xsl:for-each select="components/value/children">
        <xsl:variable name="childUuid" select="text()"/>
          <datalink>
            <sink type="processor">
              <processor><xsl:value-of select="../name"/></processor>
              <port><xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/></port>
            </sink>
            <source type="dataflow">
              <port><xsl:value-of select="/ROOT/VIRTUAL_SENSORS/*/components[uuid=$childUuid]/value/name"/></port>
            </source>
          </datalink>
        </xsl:for-each>
        <datalink>
          <sink type="dataflow">
            <port><xsl:value-of select="name"/></port>
          </sink>
          <source type="processor">
            <processor><xsl:value-of select="components/value/name"/></processor>
            <port><xsl:value-of select="components/value/name"/></port>
          </source>
        </datalink>
      </datalinks>
      <annotations></annotations>
    </dataflow>
  </xsl:for-each>
</workflow>
</xsl:template>
</xsl:stylesheet>