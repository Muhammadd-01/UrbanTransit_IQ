import os
import glob
import re

pages_dir = "/Users/muhammadaffan/Coding/UrbanTransit_IQ/frontend/src/pages/"

for filepath in glob.glob(pages_dir + "*.jsx"):
    with open(filepath, "r") as f:
        content = f.read()
        
    if "FilterContext" not in content and "API.get" in content:
        # Add import
        if "useContext" not in content:
            content = content.replace("import React, { useState, useEffect", "import React, { useState, useEffect, useContext")
            content = content.replace("import React, { useState", "import React, { useState, useContext")
        content = re.sub(r'(import \{ .*API.* \} from \'../api/client\';)', r"import { FilterContext } from '../contexts/FilterContext';\n\1", content)
        
        # Inject useContext inside component
        component_name = os.path.basename(filepath).replace(".jsx", "")
        
        # We look for "const ComponentName = () => {" or "const ComponentName = ({...}) => {"
        match = re.search(f'const {component_name} = \([^)]*\) => {{', content)
        if match:
            body_start = match.end()
            injection = "\n  const { getFilterParams, filters } = useContext(FilterContext);\n"
            content = content[:body_start] + injection + content[body_start:]
            
        # Replace empty API calls like analyticsAPI.getPassengerFlow() with analyticsAPI.getPassengerFlow(getFilterParams())
        content = re.sub(r'(API\.\w+)\(\)', r'\1(getFilterParams())', content)
        
        # Replace API calls that already have a parameter, like analyticsAPI.getKPIs({x})
        # Actually it's safer to just replace API.getXXX()
        
        # Update useEffect dependency arrays where API call happens
        # We need to find useEffect(() => { ...API... }, []);
        content = re.sub(r'(useEffect\(\(\) => \{[^}]*API\.[^}]*\}\, )\[\]\)', r'\1[filters])', content)
        
        with open(filepath, "w") as f:
            f.write(content)
        print(f"Updated {filepath}")
