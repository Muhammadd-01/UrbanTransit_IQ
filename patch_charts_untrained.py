with open("frontend/src/pages/Dashboard.jsx", "r") as f:
    content = f.read()

import re

# 1. Modify InflowVelocityChart container
inflow_target = """          <InflowVelocityChart flowData={flowData} />
        </div>"""
inflow_replacement = """          {isTrained ? (
            <InflowVelocityChart flowData={flowData} />
          ) : (
            <div style={{ height: '290px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No data available. Please train AI models first.</p>
            </div>
          )}
        </div>"""
content = content.replace(inflow_target, inflow_replacement)

# 2. Modify RootCauseChart container
rootcause_target = """          <RootCauseChart delayData={delayData} />
        </div>"""
rootcause_replacement = """          {isTrained ? (
            <RootCauseChart delayData={delayData} />
          ) : (
            <div style={{ height: '290px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No data available. Please train AI models first.</p>
            </div>
          )}
        </div>"""
content = content.replace(rootcause_target, rootcause_replacement)

with open("frontend/src/pages/Dashboard.jsx", "w") as f:
    f.write(content)
