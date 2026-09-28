const fs = require('fs');
const file = '/Users/muhammadaffan/Coding/UrbanTransit_IQ/frontend/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace labels
content = content.replace(/<div>F1-Score: <b>\{sparkResult.f1_score\}<\/b><\/div>/g, '<div>Balance Score: <b>{sparkResult.f1_score}</b></div>');
content = content.replace(/<div>Precision: <b>\{sparkResult.precision\}<\/b><\/div>/g, '<div>Correct Positive Rate: <b>{sparkResult.precision}</b></div>');
content = content.replace(/<div>Recall: <b>\{sparkResult.recall\}<\/b><\/div>/g, '<div>Detection Rate: <b>{sparkResult.recall}</b></div>');
content = content.replace(/<div>Latency: <b className="text-cyan">\{sparkResult.latency\}<\/b><\/div>/g, '<div>Response Time: <b className="text-cyan">{sparkResult.latency}</b></div>');

content = content.replace(/<div>F1-Score: <b>\{xgbResult.f1_score\}<\/b><\/div>/g, '<div>Balance Score: <b>{xgbResult.f1_score}</b></div>');
content = content.replace(/<div>Precision: <b>\{xgbResult.precision\}<\/b><\/div>/g, '<div>Correct Positive Rate: <b>{xgbResult.precision}</b></div>');
content = content.replace(/<div>Recall: <b>\{xgbResult.recall\}<\/b><\/div>/g, '<div>Detection Rate: <b>{xgbResult.recall}</b></div>');
content = content.replace(/<div>Latency: <b className="text-cyan">\{xgbResult.latency\}<\/b><\/div>/g, '<div>Response Time: <b className="text-cyan">{xgbResult.latency}</b></div>');

// Replace Conf Matrix logic
const newSparkCm = `
<div style={{ gridColumn: '1 / -1' }}>
  {(() => {
    const cm = sparkResult.cm || '';
    const match = cm.match(/TP:(\\d+)\\s+TN:(\\d+)\\s+FP:(\\d+)\\s+FN:(\\d+)/);
    if (match) {
      const correct = parseInt(match[1]) + parseInt(match[2]);
      const wrong = parseInt(match[3]) + parseInt(match[4]);
      return <>Correct Predictions: <b>{correct.toLocaleString()}</b> ✓ &nbsp; Wrong Predictions: <b>{wrong.toLocaleString()}</b> ✗</>;
    }
    return <>Conf. Matrix: <b>{cm}</b></>;
  })()}
</div>`;
content = content.replace(/<div style=\{\{ gridColumn: '1 \/ -1' \}\}>Conf. Matrix: <b style=\{\{ fontSize: '0.8rem' \}\}>\{sparkResult.cm\}<\/b><\/div>/g, newSparkCm.trim());

const newXgbCm = `
<div style={{ gridColumn: '1 / -1' }}>
  {(() => {
    const cm = xgbResult.cm || '';
    const match = cm.match(/TP:(\\d+)\\s+TN:(\\d+)\\s+FP:(\\d+)\\s+FN:(\\d+)/);
    if (match) {
      const correct = parseInt(match[1]) + parseInt(match[2]);
      const wrong = parseInt(match[3]) + parseInt(match[4]);
      return <>Correct Predictions: <b>{correct.toLocaleString()}</b> ✓ &nbsp; Wrong Predictions: <b>{wrong.toLocaleString()}</b> ✗</>;
    }
    return <>Conf. Matrix: <b>{cm}</b></>;
  })()}
</div>`;
content = content.replace(/<div style=\{\{ gridColumn: '1 \/ -1' \}\}>Conf. Matrix: <b style=\{\{ fontSize: '0.8rem' \}\}>\{xgbResult.cm\}<\/b><\/div>/g, newXgbCm.trim());

fs.writeFileSync(file, content, 'utf8');
