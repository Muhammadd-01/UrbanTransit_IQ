#!/bin/bash
# UrbanTransit IQ — Hadoop Pseudo-Distributed Setup Script
# For macOS with 16 GB RAM
# This script sets up a single-node pseudo-distributed Hadoop cluster

set -e

HADOOP_VERSION="3.3.6"
HADOOP_HOME="${HOME}/hadoop/hadoop-${HADOOP_VERSION}"
HADOOP_CONF_DIR="${HADOOP_HOME}/etc/hadoop"
JAVA_HOME="$(/usr/libexec/java_home -v 17 2>/dev/null || echo '/usr/local/opt/openjdk@17')"

echo "============================================"
echo "UrbanTransit IQ — Hadoop Setup"
echo "============================================"
echo "Hadoop Version: ${HADOOP_VERSION}"
echo "Java Home: ${JAVA_HOME}"
echo ""

# Check Java
if [ ! -d "${JAVA_HOME}" ]; then
    echo "ERROR: Java 17 not found. Install with: brew install openjdk@17"
    exit 1
fi

# Export JAVA_HOME
export JAVA_HOME="${JAVA_HOME}"
export PATH="${JAVA_HOME}/bin:${PATH}"

echo "Java version:"
java -version
echo ""

# Download Hadoop if not present
if [ ! -d "${HADOOP_HOME}" ]; then
    echo "Downloading Hadoop ${HADOOP_VERSION}..."
    mkdir -p "${HOME}/hadoop"
    cd "${HOME}/hadoop"
    
    HADOOP_URL="https://dlcdn.apache.org/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz"
    HADOOP_MIRROR="https://archive.apache.org/dist/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz"
    
    if ! curl -L -o "hadoop-${HADOOP_VERSION}.tar.gz" "${HADOOP_URL}" 2>/dev/null; then
        echo "Primary URL failed, trying mirror..."
        curl -L -o "hadoop-${HADOOP_VERSION}.tar.gz" "${HADOOP_MIRROR}"
    fi
    
    echo "Extracting Hadoop..."
    tar -xzf "hadoop-${HADOOP_VERSION}.tar.gz"
    rm "hadoop-${HADOOP_VERSION}.tar.gz"
    echo "Hadoop extracted to ${HADOOP_HOME}"
else
    echo "Hadoop already installed at ${HADOOP_HOME}"
fi

# Configure Hadoop
echo ""
echo "Configuring Hadoop for pseudo-distributed mode..."

# Set JAVA_HOME in hadoop-env.sh
sed -i.bak "s|# export JAVA_HOME=.*|export JAVA_HOME=${JAVA_HOME}|" "${HADOOP_CONF_DIR}/hadoop-env.sh"

# core-site.xml
cat > "${HADOOP_CONF_DIR}/core-site.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:9000</value>
    </property>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/tmp/hadoop-${user.name}</value>
    </property>
</configuration>
EOF

# hdfs-site.xml (replication=1 for pseudo-distributed, memory-optimized)
cat > "${HADOOP_CONF_DIR}/hdfs-site.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:///tmp/hadoop-hdfs/namenode</value>
    </property>
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:///tmp/hadoop-hdfs/datanode</value>
    </property>
    <property>
        <name>dfs.namenode.handler.count</name>
        <value>10</value>
    </property>
    <!-- Memory optimization for 16GB Mac -->
    <property>
        <name>dfs.namenode.heap.size</name>
        <value>512m</value>
    </property>
</configuration>
EOF

# mapred-site.xml
cat > "${HADOOP_CONF_DIR}/mapred-site.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
</configuration>
EOF

# yarn-site.xml (memory-optimized for 16GB)
cat > "${HADOOP_CONF_DIR}/yarn-site.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.nodemanager.resource.memory-mb</name>
        <value>4096</value>
    </property>
    <property>
        <name>yarn.scheduler.maximum-allocation-mb</name>
        <value>4096</value>
    </property>
    <property>
        <name>yarn.nodemanager.vmem-check-enabled</name>
        <value>false</value>
    </property>
</configuration>
EOF

# Copy configuration to project
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"
cp "${HADOOP_CONF_DIR}/core-site.xml" "${PROJECT_DIR}/hadoop/configuration/"
cp "${HADOOP_CONF_DIR}/hdfs-site.xml" "${PROJECT_DIR}/hadoop/configuration/"
cp "${HADOOP_CONF_DIR}/mapred-site.xml" "${PROJECT_DIR}/hadoop/configuration/"
cp "${HADOOP_CONF_DIR}/yarn-site.xml" "${PROJECT_DIR}/hadoop/configuration/"

# Check SSH (required for pseudo-distributed)
echo ""
echo "Checking SSH configuration..."
if ! ssh localhost exit 2>/dev/null; then
    echo "NOTE: SSH to localhost is not configured."
    echo "Enable Remote Login in System Preferences > Sharing"
    echo "Then run: ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa"
    echo "And: cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys"
    echo "And: chmod 0600 ~/.ssh/authorized_keys"
fi

# Format NameNode (only if not already formatted)
if [ ! -d "/tmp/hadoop-hdfs/namenode/current" ]; then
    echo ""
    echo "Formatting HDFS NameNode..."
    "${HADOOP_HOME}/bin/hdfs" namenode -format -force
fi

echo ""
echo "============================================"
echo "Hadoop Setup Complete!"
echo "============================================"
echo ""
echo "Add these to your shell profile (~/.zshrc):"
echo ""
echo "  export JAVA_HOME=${JAVA_HOME}"
echo "  export HADOOP_HOME=${HADOOP_HOME}"
echo "  export PATH=\$HADOOP_HOME/bin:\$HADOOP_HOME/sbin:\$JAVA_HOME/bin:\$PATH"
echo ""
echo "Then start HDFS with:"
echo "  start-dfs.sh"
echo ""
echo "Verify with:"
echo "  hdfs dfs -ls /"
echo "  jps   # Should show NameNode, DataNode, SecondaryNameNode"
echo ""
