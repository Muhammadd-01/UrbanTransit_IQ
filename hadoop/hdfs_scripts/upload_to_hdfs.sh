#!/bin/bash
# UrbanTransit IQ — Upload Data to HDFS
# Uploads raw CSV files to HDFS for Spark processing

set -e

HADOOP_HOME="${HADOOP_HOME:-${HOME}/hadoop/hadoop-3.3.6}"
HDFS_BASE="/urbantransit"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DATA_DIR="${PROJECT_DIR}/data/raw"

echo "============================================"
echo "UrbanTransit IQ — HDFS Upload"
echo "============================================"
echo "Project Dir: ${PROJECT_DIR}"
echo "Data Dir: ${DATA_DIR}"
echo "HDFS Base: ${HDFS_BASE}"
echo ""

# Check HDFS is running
if ! "${HADOOP_HOME}/bin/hdfs" dfs -ls / > /dev/null 2>&1; then
    echo "ERROR: HDFS is not running. Start with: start-dfs.sh"
    exit 1
fi

# Create HDFS directories
echo "Creating HDFS directories..."
"${HADOOP_HOME}/bin/hdfs" dfs -mkdir -p "${HDFS_BASE}/raw"
"${HADOOP_HOME}/bin/hdfs" dfs -mkdir -p "${HDFS_BASE}/cleaned"
"${HADOOP_HOME}/bin/hdfs" dfs -mkdir -p "${HDFS_BASE}/processed"
"${HADOOP_HOME}/bin/hdfs" dfs -mkdir -p "${HDFS_BASE}/parquet"
"${HADOOP_HOME}/bin/hdfs" dfs -mkdir -p "${HDFS_BASE}/models"

# Upload raw data files
echo ""
echo "Uploading raw data to HDFS..."
for file in "${DATA_DIR}"/*.csv; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "  Uploading ${filename}..."
        "${HADOOP_HOME}/bin/hdfs" dfs -put -f "$file" "${HDFS_BASE}/raw/${filename}"
    fi
done

# Upload JSON files if any
for file in "${DATA_DIR}"/*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "  Uploading ${filename}..."
        "${HADOOP_HOME}/bin/hdfs" dfs -put -f "$file" "${HDFS_BASE}/raw/${filename}"
    fi
done

echo ""
echo "============================================"
echo "Upload Complete!"
echo "============================================"
echo ""
echo "HDFS contents:"
"${HADOOP_HOME}/bin/hdfs" dfs -ls -R "${HDFS_BASE}/raw"
echo ""
echo "Total size:"
"${HADOOP_HOME}/bin/hdfs" dfs -du -s -h "${HDFS_BASE}/raw"
echo ""
