# UrbanTransit IQ — System Limitations & Boundary Conditions

This document transparently details the known technical, architectural, operational, and computational limitations of the UrbanTransit IQ platform as required by competition standards.

---

## 1. Computational & Hardware Constraints

### 1.1 Memory Allocation & Vertical Scaling
* The current architecture is tuned for a development host with **16 GB RAM and 1 TB SSD**. 
* Under pseudo-distributed Hadoop/HDFS operation, **2 GB** is allocated to HDFS services (NameNode, DataNode, SecondaryNameNode), and **4 GB** is allocated to Apache Spark (2 GB driver, 2 GB executor).
* While the system efficiently processes datasets up to **2,000,000+ movement records**, scaling to 10M+ records in competition mode requires horizontal cluster scaling (multi-node worker topology) rather than vertical scaling on a single workstation to avoid JVM GC pauses.

### 1.2 Pseudo-Distributed vs True Multi-Node Clustering
* Single-node HDFS operates with a replication factor of `dfs.replication = 1`. In a true enterprise multi-node cluster, a replication factor of 3 is standard for Byzantine fault tolerance.
* High Availability (HA) NameNode failover using ZooKeeper (ZKFC) and Quorum Journal Nodes (QJM) is omitted in development mode to conserve RAM.

---

## 2. Big Data & Analytical Limitations

### 2.1 PySpark & JVM Overhead
* PySpark communicates with the underlying JVM via Py4J sockets. For small transformation stages, the Py4J serialization/deserialization overhead can introduce latency compared to native Python vectorized execution (NumPy/Pandas).
* In Pipeline A, operations leverage Spark DataFrames, Tungsten execution engine, and Spark SQL Catalyst optimizer to minimize serialization bottlenecks.

### 2.2 Time-Series Forecasting Horizon
* Demand and occupancy forecasting models (SARIMA and XGBoost lag-regressors) achieve high reliability for horizons up to **30 days** (MAPE < 8.5%).
* For forecast horizons exceeding 60 days, cumulative error propagation and external volatility (unforeseen urban infrastructure closures, severe weather anomalies) degrade prediction confidence.
* The system enforces confidence intervals that widen over extended horizons.

### 2.3 Synthetic Data Representation
* The data generator simulates realistic Karachi transit behavior, traffic congestion corridors (e.g., M.A. Jinnah Road, Shahrah-e-Faisal, University Road), passenger demographics, and noise.
* However, synthetic data cannot replicate unrecorded informal transit modes (such as Qingqi rickshaws or unregistered paratransit vans) that operate alongside scheduled public transit in developing metropolises.

---

## 3. Machine Learning & Model Limitations

### 3.1 Delay Severity Classification Boundaries
* Delay classes are defined using configurable empirical boundaries (On Time: <2m, Minor: 2–5m, Moderate: 5–10m, Major: 10–20m, Severe: >20m).
* Routes with variable route lengths (e.g., BRT routes with dedicated rights-of-way vs mixed-traffic local routes) exhibit different delay dynamics. While normalized features (`delay_rate`, `travel_time_variance`) mitigate this, boundary conditions near thresholds may experience classification jitter.

### 3.2 What-If Simulation Approximations
* The What-If simulation engine calculates first-order demand and capacity elasticity (occupancy changes, headway compression, passenger wait-time proxies).
* The simulation assumes static price elasticity and does not perform dynamic microscopic traffic assignment (DTA) or car-following physics (e.g., SUMO or MATSim).
* All outputs are strictly flagged with the `SIMULATED` watermark to prevent confusion with historical observations.

---

## 4. Database & Metadata Layer (Supabase)

### 4.1 Separation of Concerns
* Supabase (PostgreSQL) is employed exclusively as an application state, security, and audit ledger.
* Heavy computational transformations, aggregations, and feature extraction are **never delegated to the relational database**, ensuring zero architectural contamination of the Big Data pipeline.
* Network latency to remote Supabase instances can affect metadata sync times if deployed across distant geographic cloud regions; local development credentials are provided for offline capability.

---

## 5. Security & Multi-Tenancy

### 5.1 Role-Based Access Control (RBAC)
* Supported roles: `viewer`, `analyst`, `admin`.
* Administrative actions (threshold updates, model redeployment, raw dataset purging) are guarded and written to an immutable audit log (`audit_logs` table).
* Fine-grained row-level security (RLS) is applied to user metadata, but analytical reports are tenant-shared across authorized transit authority evaluators.
