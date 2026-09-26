#!/bin/zsh
PAGES_DIR="/Users/muhammadaffan/Coding/UrbanTransit_IQ/frontend/src/pages"

typeset -A CONTEXTS
CONTEXTS=(
  "DelayAnalytics.jsx" "Model predicts delay probabilities by correlating telemetry with historical delay events."
  "RouteIntelligence.jsx" "Route performance metrics and adherence gaps directly feed the ML pipeline."
  "ODAnalysis.jsx" "Origin-Destination patterns from millions of records help train spatial clustering models."
  "VehicleAnalytics.jsx" "Vehicle load capacities and active utilization form the backbone of the overcrowding classifier."
  "AnomalyDetection.jsx" "Anomalies detected here are cross-referenced with ML predictions for robust outlier isolation."
  "Clustering.jsx" "Passenger segments derived directly from the trained historical dataset."
  "Forecasting.jsx" "Demand forecasts are generated using the same underlying 2M+ records."
  "WhatIfSimulator.jsx" "Counterfactual scenarios are simulated using the baseline model trained on historical data."
  "Recommendations.jsx" "Automated recommendations are powered by deep ML intelligence and historical inference."
  "DataQuality.jsx" "Quality audit across the full 2M+ record dataset guarantees clean training data."
  "DataManagement.jsx" "Synthetic datasets generated match the distribution profile of the ML pipeline data."
  "Reports.jsx" "Compliance and performance reports generated strictly from verified ML-audited datasets."
)

for file in ${(k)CONTEXTS}; do
  filepath="$PAGES_DIR/$file"
  if [ -f "$filepath" ]; then
    echo "Processing $file..."
    
    # 1. Insert import after the last import statement using awk
    awk '/^import / {last=NR} {lines[NR]=$0} END {for(i=1;i<=NR;i++) {print lines[i]; if(i==last) print "import PipelineBanner from \x27../components/common/PipelineBanner\x27;"}}' "$filepath" > "${filepath}.tmp"
    mv "${filepath}.tmp" "$filepath"

    # 2. Insert PipelineBanner right after className="page-container..."
    msg="${CONTEXTS[$file]}"
    sed -i '' -E "s/(<div className=\"page-container[^\"]*\">)/\1\n      <PipelineBanner contextMessage=\"$msg\" \/>/g" "$filepath"
  fi
done
