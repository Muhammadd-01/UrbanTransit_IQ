with open("frontend/src/pages/Dashboard.jsx", "r") as f:
    content = f.read()

# Fix displayPassengers
content = content.replace("const displayPassengers = isTrained ? Math.round(", "const displayPassengers = Math.round(")
content = content.replace(") : 0;", ");")

# Fix displayOccupancy
content = content.replace("const displayOccupancy = isTrained ? Math.min(", "const displayOccupancy = Math.min(")

# Fix displayDelay
content = content.replace("const displayDelay = isTrained ? (", "const displayDelay = (")

with open("frontend/src/pages/Dashboard.jsx", "w") as f:
    f.write(content)
