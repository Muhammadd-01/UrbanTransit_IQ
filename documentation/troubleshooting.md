# UrbanTransit IQ — Troubleshooting & Operations Guide

This guide provides troubleshooting procedures for common runtime, dependency, and infrastructure issues encountered during local development and competition demonstration.

---

## 1. Environment & Python Issues

### Issue: `ModuleNotFoundError` when starting FastAPI
* **Cause:** Virtual environment not activated, or working directory incorrect.
* **Resolution:**
  ```bash
  cd /Users/muhammadaffan/Coding/UrbanTransit_IQ
  source venv/bin/activate
  python -m uvicorn backend.app.main:app --reload --port 8000
  ```

### Issue: PySpark requires Java Runtime
* **Cause:** Java 17 not on system `PATH` or `JAVA_HOME` unset.
* **Resolution:**
  ```bash
  export JAVA_HOME="/usr/local/opt/openjdk@17"
  export PATH="${JAVA_HOME}/bin:${PATH}"
  java -version
  ```

---

## 2. Hadoop & HDFS Issues

### Issue: HDFS fails to start (`start-dfs.sh`)
* **Symptom:** `Cannot connect to localhost:9000` or connection refused.
* **Diagnosis:**
  1. Check SSH to localhost:
     ```bash
     ssh localhost
     ```
     If prompted for a password, enable Remote Login in macOS Settings > General > Sharing, and add your public key:
     ```bash
     cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
     chmod 600 ~/.ssh/authorized_keys
     ```
  2. Format NameNode if first run:
     ```bash
     hdfs namenode -format -force
     ```
  3. Inspect logs in `$HADOOP_HOME/logs/`.

### Issue: HDFS Out of Memory on 16 GB Mac
* **Cause:** Default Hadoop heap allocation is too large for single-node machines.
* **Resolution:** Ensure `HADOOP_HEAPSIZE_MAX=512m` or `HADOOP_NAMENODE_OPTS="-Xmx512m"` is set in `$HADOOP_HOME/etc/hadoop/hadoop-env.sh`.

---

## 3. Apache Spark Issues

### Issue: Py4JJavaError or Spark Driver OOM
* **Cause:** Spark attempting to load entire unpartitioned dataset into single executor.
* **Resolution:**
  * Verify `spark.driver.memory=2g` and `spark.executor.memory=2g` in `config/spark_config.py`.
  * Ensure columnar Parquet partition strategy is utilized:
    ```python
    df.write.partitionBy("year", "month").parquet("data/parquet/...")
    ```

---

## 4. Frontend & React Issues

### Issue: API connection failure (Network Error or CORS)
* **Cause:** Backend not running on port 8000 or CORS origin mismatch.
* **Resolution:**
  1. Verify backend health endpoint:
     ```bash
     curl http://localhost:8000/health
     ```
  2. Verify `CORS_ORIGINS` in `config/settings.py` includes `"http://localhost:3000"`.

### Issue: Leaflet map markers not rendering or tile gray-out
* **Cause:** Leaflet CSS missing or container rendered before dimensions are resolved.
* **Resolution:** Ensure `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />` is in `frontend/public/index.html`.

---

## 5. Supabase & Database Metadata Issues

### Issue: Supabase credentials not set
* **Behavior:** Backend starts in offline development fallback mode with simulated metadata persistence.
* **Resolution:** Supply `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env` once provisioned.
