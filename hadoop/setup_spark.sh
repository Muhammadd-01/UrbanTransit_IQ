#!/bin/bash
# UrbanTransit IQ — Spark Standalone Setup Script
# For macOS with 16 GB RAM

set -e

SPARK_VERSION="3.5.1"
HADOOP_PROFILE="3"
SPARK_HOME="${HOME}/spark/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_PROFILE}"
JAVA_HOME="$(/usr/libexec/java_home -v 17 2>/dev/null || echo '/usr/local/opt/openjdk@17')"

echo "============================================"
echo "UrbanTransit IQ — Spark Setup"
echo "============================================"
echo "Spark Version: ${SPARK_VERSION}"
echo "Java Home: ${JAVA_HOME}"
echo ""

# Check Java
export JAVA_HOME="${JAVA_HOME}"
export PATH="${JAVA_HOME}/bin:${PATH}"

# Download Spark if not present
if [ ! -d "${SPARK_HOME}" ]; then
    echo "Downloading Spark ${SPARK_VERSION}..."
    mkdir -p "${HOME}/spark"
    cd "${HOME}/spark"
    
    SPARK_URL="https://dlcdn.apache.org/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_PROFILE}.tgz"
    SPARK_MIRROR="https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_PROFILE}.tgz"
    
    if ! curl -L -o "spark-${SPARK_VERSION}.tgz" "${SPARK_URL}" 2>/dev/null; then
        echo "Primary URL failed, trying mirror..."
        curl -L -o "spark-${SPARK_VERSION}.tgz" "${SPARK_MIRROR}"
    fi
    
    echo "Extracting Spark..."
    tar -xzf "spark-${SPARK_VERSION}.tgz"
    rm "spark-${SPARK_VERSION}.tgz"
    echo "Spark extracted to ${SPARK_HOME}"
else
    echo "Spark already installed at ${SPARK_HOME}"
fi

# Configure Spark for 16GB Mac
echo ""
echo "Configuring Spark..."

cat > "${SPARK_HOME}/conf/spark-defaults.conf" << EOF
spark.master                     local[*]
spark.driver.memory              2g
spark.executor.memory            2g
spark.sql.shuffle.partitions     8
spark.default.parallelism        4
spark.sql.parquet.compression.codec snappy
spark.serializer                 org.apache.spark.serializer.KryoSerializer
spark.sql.adaptive.enabled       true
spark.sql.adaptive.coalescePartitions.enabled true
spark.ui.port                    4040
spark.eventLog.enabled           false
EOF

cat > "${SPARK_HOME}/conf/spark-env.sh" << EOF
#!/usr/bin/env bash
export JAVA_HOME=${JAVA_HOME}
export SPARK_WORKER_MEMORY=4g
export SPARK_DAEMON_MEMORY=512m
export PYSPARK_PYTHON=python3
EOF

chmod +x "${SPARK_HOME}/conf/spark-env.sh"

# Copy config to project
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"
cp "${SPARK_HOME}/conf/spark-defaults.conf" "${PROJECT_DIR}/hadoop/configuration/" 2>/dev/null || true

echo ""
echo "============================================"
echo "Spark Setup Complete!"
echo "============================================"
echo ""
echo "Add these to your shell profile (~/.zshrc):"
echo ""
echo "  export SPARK_HOME=${SPARK_HOME}"
echo "  export PATH=\$SPARK_HOME/bin:\$PATH"
echo "  export PYSPARK_PYTHON=python3"
echo ""
echo "Test with:"
echo "  spark-submit --version"
echo "  pyspark"
echo ""
echo "Spark UI will be available at: http://localhost:4040 (when running)"
echo ""
