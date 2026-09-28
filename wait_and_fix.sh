#!/bin/bash
echo "Waiting for passenger_counts generation to complete..."
while true; do
  COUNT=$(./venv/bin/python -c "from pymongo import MongoClient; print(MongoClient('mongodb://localhost:27017/')['urbantransit_iq'].passenger_counts.count_documents({}))")
  if [ "$COUNT" -ge 3000000 ]; then
    echo "3 million records reached. Running fix script..."
    ./venv/bin/python fix_mongo_data.py
    echo "Done."
    break
  fi
  sleep 5
done
