import re

with open('frontend/src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

# Extract the pipeline panel HTML from cockpit-right-wing
pipeline_regex = r"(<\!-- 1\. Algorithmic Pipeline Engine -->\s*<div className=\"intelligence-panel hud-panel hud-corners\">[\s\S]*?</div>\s*</div>\s*</div>\s*</div>\s*</div>)"

match = re.search(pipeline_regex, content)
if match:
    pipeline_html = match.group(1)
    
    # Remove from right wing
    # wait, the regex captures more divs at the end. Let's be precise.
