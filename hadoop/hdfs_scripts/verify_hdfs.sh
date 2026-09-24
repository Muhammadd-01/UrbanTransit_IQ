#!/bin/bash
# UrbanTransit IQ — HDFS Verification Script
# Verifies HDFS is operational and data is correctly stored

set -e

HADOOP_HOME="${HADOOP_HOME:-${HOME}/hadoop/hadoop-3.3.6}"
HDFS_BASE="/urbantransit"

echo "============================================"
echo "UrbanTransit IQ — HDFS Verification Report"
echo "============================================"
echo "Date: $(date)"
echo ""

# 1. Check HDFS processes
echo "1. HDFS Processes (jps):"
echo "---"
jps 2>/dev/null || echo "  jps not available"
echo ""

# 2. Check HDFS health
echo "2. HDFS Health:"
echo "---"
"${HADOOP_HOME}/bin/hdfs" dfsadmin -report 2>/dev/null | head -20 || echo "  Could not get HDFS report"
echo ""

# 3. List HDFS contents
echo "3. HDFS Contents (${HDFS_BASE}):"
echo "---"
"${HADOOP_HOME}/bin/hdfs" dfs -ls -R "${HDFS_BASE}" 2>/dev/null || echo "  No data in HDFS yet"
echo ""

# 4. File sizes
echo "4. HDFS File Sizes:"
echo "---"
"${HADOOP_HOME}/bin/hdfs" dfs -du -h "${HDFS_BASE}/raw" 2>/dev/null || echo "  No raw data"
echo ""

# 5. Total storage
echo "5. Total HDFS Storage Used:"
echo "---"
"${HADOOP_HOME}/bin/hdfs" dfs -du -s -h "${HDFS_BASE}" 2>/dev/null || echo "  No data"
echo ""

# 6. Verify file count
echo "6. File Count per Directory:"
echo "---"
for dir in raw cleaned processed parquet models; do
    count=$("${HADOOP_HOME}/bin/hdfs" dfs -count "${HDFS_BASE}/${dir}" 2>/dev/null | awk '{print $2}' || echo "0")
    echo "  ${HDFS_BASE}/${dir}: ${count} files"
done
echo ""

# 7. Sample file check
echo "7. Sample File Head (first raw CSV):"
echo "---"
first_file=$("${HADOOP_HOME}/bin/hdfs" dfs -ls "${HDFS_BASE}/raw" 2>/dev/null | grep "\.csv" | head -1 | awk '{print $NF}')
if [ -n "${first_file}" ]; then
    echo "  File: ${first_file}"
    "${HADOOP_HOME}/bin/hdfs" dfs -cat "${first_file}" 2>/dev/null | head -5
fi
echo ""

echo "============================================"
echo "HDFS Verification Complete"
echo "============================================"
