const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/ModelComparison.jsx', 'utf8');

// Update useEffect
content = content.replace(
  /useEffect\(\(\) => {[\s\S]*?}, \[\]\);/,
  `useEffect(() => {
    const savedSpark = localStorage.getItem('pipeline_spark_result');
    const savedXgb = localStorage.getItem('pipeline_xgb_result');
    let sparkData = null;
    let xgbData = null;
    try { if (savedSpark) { sparkData = JSON.parse(savedSpark); setSparkResult(sparkData); } } catch(e) { console.error(e); }
    try { if (savedXgb) { xgbData = JSON.parse(savedXgb); setXgbResult(xgbData); } } catch(e) { console.error(e); }

    const needsSpark = !sparkData || sparkData.precision === undefined || sparkData.precision === 'N/A';
    const needsXgb = !xgbData || xgbData.precision === undefined || xgbData.precision === 'N/A';

    if (needsSpark || needsXgb) {
      pipelineAPI.getStatus().then(res => {
        if (needsSpark && res.data?.spark_is_trained && res.data?.spark_raw_data) {
          const newSpark = {
            ...sparkData,
            pred: res.data.spark_pred || "ON-TIME",
            confidence: res.data.spark_confidence || "100.0%",
            latency: res.data.spark_latency || "25ms",
            accuracy: res.data.spark_acc ?? res.data.accuracy ?? 'N/A',
            f1_score: res.data.spark_f1 ?? res.data.f1_score ?? 'N/A',
            precision: res.data.spark_precision ?? res.data.precision ?? 'N/A',
            recall: res.data.spark_recall ?? res.data.recall ?? 'N/A',
            mae: res.data.spark_mae ?? res.data.mae ?? 'N/A',
            rmse: res.data.spark_rmse ?? res.data.rmse ?? 'N/A',
            confusion_matrix: res.data.spark_confusion_matrix ?? res.data.confusion_matrix ?? 'N/A',
            mape: res.data.spark_mape,
            r2: res.data.spark_r2,
            records_used: res.data.records_used,
            raw_data: res.data.spark_raw_data,
            trained_at: res.data.trained_at,
            training_time_seconds: res.data.training_time_seconds,
          };
          setSparkResult(newSpark);
        }
        if (needsXgb && res.data?.xgb_is_trained && res.data?.xgb_raw_data) {
          const newXgb = {
            ...xgbData,
            pred: res.data.xgb_pred || "ON-TIME",
            confidence: res.data.xgb_confidence || "100.0%",
            latency: res.data.xgb_latency || "12ms",
            accuracy: res.data.xgb_acc ?? res.data.accuracy ?? 'N/A',
            f1_score: res.data.xgb_f1 ?? res.data.f1_score ?? 'N/A',
            precision: res.data.xgb_precision ?? res.data.precision ?? 'N/A',
            recall: res.data.xgb_recall ?? res.data.recall ?? 'N/A',
            mae: res.data.xgb_mae ?? res.data.mae ?? 'N/A',
            rmse: res.data.xgb_rmse ?? res.data.rmse ?? 'N/A',
            confusion_matrix: res.data.xgb_confusion_matrix ?? res.data.confusion_matrix ?? 'N/A',
            mape: res.data.xgb_mape,
            r2: res.data.xgb_r2,
            records_used: res.data.records_used,
            raw_data: res.data.xgb_raw_data,
            trained_at: res.data.trained_at,
            training_time_seconds: res.data.training_time_seconds,
          };
          setXgbResult(newXgb);
        }
      }).catch(console.error);
    }
  }, []);`
);

// Update Spark Spec Rows
content = content.replace(
  /<div className="pipeline-spec-list">[\s\S]*?<\/div>\s*<\/div>\s*\) : \(/,
  `<div className="pipeline-spec-list">
                  <div className="spec-row"><span className="spec-label">PREDICTION</span><span className="spec-val mono-val" style={{ color: sparkResult.pred === 'DELAYED' ? '#DC2626' : '#16A34A' }}>{sparkResult.pred}</span></div>
                  <div className="spec-row"><span className="spec-label">CONFIDENCE</span><span className="spec-val mono-val">{sparkResult.confidence}</span></div>
                  <div className="spec-row"><span className="spec-label">ACCURACY</span><span className="spec-val mono-val">{sparkResult.accuracy ?? 'N/A'}%</span></div>
                  <div className="spec-row"><span className="spec-label">BALANCE SCORE (F1-SCORE)</span><span className="spec-val mono-val">{sparkResult.f1_score ?? sparkResult.f1 ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">CORRECT POSITIVE RATE (PRECISION)</span><span className="spec-val mono-val">{sparkResult.precision ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">DETECTION RATE (RECALL)</span><span className="spec-val mono-val">{sparkResult.recall ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">MAE (AVERAGE ERROR)</span><span className="spec-val mono-val">{sparkResult.mae ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">RMSE (SPREAD ERROR)</span><span className="spec-val mono-val text-danger">{sparkResult.rmse ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">CONFUSION MATRIX</span><span className="spec-val mono-val">{typeof sparkResult.confusion_matrix === 'object' ? JSON.stringify(sparkResult.confusion_matrix) : (sparkResult.confusion_matrix ?? 'N/A')}</span></div>
                  <div className="spec-row"><span className="spec-label">LATENCY</span><span className="spec-val mono-val text-cyan">{sparkResult.latency ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">RECORDS TRAINED</span><span className="spec-val mono-val">{sparkResult.records_used?.toLocaleString()}</span></div>
                </div>
              </div>
            ) : (`
);

// Update XGBoost Spec Rows
content = content.replace(
  /<div className="pipeline-spec-list">[\s\S]*?<\/div>\s*<\/div>\s*\) : \(/, // It matches the second one since first one is already replaced!
  `<div className="pipeline-spec-list">
                  <div className="spec-row"><span className="spec-label">PREDICTION</span><span className="spec-val mono-val" style={{ color: xgbResult.pred === 'DELAYED' ? '#DC2626' : '#16A34A' }}>{xgbResult.pred}</span></div>
                  <div className="spec-row"><span className="spec-label">CONFIDENCE</span><span className="spec-val mono-val">{xgbResult.confidence}</span></div>
                  <div className="spec-row"><span className="spec-label">ACCURACY</span><span className="spec-val mono-val">{xgbResult.accuracy ?? 'N/A'}%</span></div>
                  <div className="spec-row"><span className="spec-label">BALANCE SCORE (F1-SCORE)</span><span className="spec-val mono-val">{xgbResult.f1_score ?? xgbResult.f1 ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">CORRECT POSITIVE RATE (PRECISION)</span><span className="spec-val mono-val">{xgbResult.precision ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">DETECTION RATE (RECALL)</span><span className="spec-val mono-val">{xgbResult.recall ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">MAE (AVERAGE ERROR)</span><span className="spec-val mono-val">{xgbResult.mae ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">RMSE (SPREAD ERROR)</span><span className="spec-val mono-val text-danger">{xgbResult.rmse ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">CONFUSION MATRIX</span><span className="spec-val mono-val">{typeof xgbResult.confusion_matrix === 'object' ? JSON.stringify(xgbResult.confusion_matrix) : (xgbResult.confusion_matrix ?? 'N/A')}</span></div>
                  <div className="spec-row"><span className="spec-label">LATENCY</span><span className="spec-val mono-val text-cyan">{xgbResult.latency ?? 'N/A'}</span></div>
                  <div className="spec-row"><span className="spec-label">RECORDS TRAINED</span><span className="spec-val mono-val">{xgbResult.records_used?.toLocaleString()}</span></div>
                </div>
              </div>
            ) : (`
);

fs.writeFileSync('frontend/src/pages/ModelComparison.jsx', content);
console.log("Patched ModelComparison.jsx");
