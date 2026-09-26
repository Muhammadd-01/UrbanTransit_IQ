import time
import pandas as pd
from sqlalchemy import text
from backend.app.database.engine import SessionLocal
import xgboost as xgb

start = time.time()
db = SessionLocal()
print(f"Connecting to DB... {time.time() - start:.2f}s")

query = text("""
    SELECT 
        p.boarding, p.alighting, p.load,
        EXTRACT(HOUR FROM p.timestamp) as hour,
        CASE WHEN d.delay_minutes IS NOT NULL AND d.delay_minutes > 5 THEN 1 ELSE 0 END as is_delayed
    FROM passenger_counts p
    LEFT JOIN delays d ON p.route_id = d.route_id 
        AND DATE(p.timestamp) = DATE(d.timestamp)
        AND EXTRACT(HOUR FROM p.timestamp) = EXTRACT(HOUR FROM d.timestamp)
    WHERE p.boarding IS NOT NULL
""")
# Note: No limit
start_q = time.time()
result = db.execute(query).fetchall()
print(f"Query finished... {time.time() - start_q:.2f}s, rows: {len(result)}")

df = pd.DataFrame(result, columns=["boarding", "alighting", "load", "hour", "is_delayed"])
df.fillna(0, inplace=True)
df["hour"] = pd.to_numeric(df["hour"], errors='coerce').fillna(0).astype(int)
df["boarding"] = pd.to_numeric(df["boarding"], errors='coerce').fillna(0).astype(float)
df["alighting"] = pd.to_numeric(df["alighting"], errors='coerce').fillna(0).astype(float)
df["load"] = pd.to_numeric(df["load"], errors='coerce').fillna(0).astype(float)
df["is_delayed"] = pd.to_numeric(df["is_delayed"], errors='coerce').fillna(0).astype(int)

X = df[["boarding", "alighting", "load", "hour"]]
y = df["is_delayed"]

print(f"DataFrame ready... {time.time() - start:.2f}s")

model = xgb.XGBClassifier(n_estimators=100, max_depth=6, random_state=42)
start_t = time.time()
model.fit(X, y)
print(f"Training finished... {time.time() - start_t:.2f}s")

print(f"Total time: {time.time() - start:.2f}s")
