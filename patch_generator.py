import re

with open("scripts/generate_exact_3m_mongo.py", "r") as f:
    content = f.read()

# Fix is_delayed noise for 85-88% accuracy
content = content.replace("score += random.gauss(0, 0.8)", "score += random.gauss(0, 0.5)")

# Replace the counts
content = content.replace("total_passenger_counts = 3000000", "total_passenger_counts = 1000000")
content = content.replace("Generating 3,000,000 Passenger Counts", "Generating 1,000,000 Passenger Counts")
content = content.replace("3,000,000 passenger_counts into", "1,000,000 passenger_counts into")

content = content.replace("Generating 3,000,000 Tickets in batches of 100,000...", "Generating 1,000,000 Tickets in batches of 100,000...")
content = content.replace("range(0, 3000000, 100000)", "range(0, 1000000, 100000)")
content = content.replace("Generating 1,000,000 Passengers...", "Generating 400,000 Passengers...")
content = content.replace("range(0, 1000000, 50000)", "range(0, 400000, 50000)")

content = content.replace("Generating 2,500,000 Delays", "Generating 500,000 Delays")
content = content.replace("range(0, 2500000, 100000)", "range(0, 500000, 100000)")

content = content.replace("Generating 500,000 Trips...", "Generating 96,135 Trips...")
content = content.replace("range(0, 500000, 50000)", "range(0, 96135, 50000)")

content = content.replace("Generating 500,000 GPS Events...", "Generating 0 GPS Events...")
content = content.replace("range(0, 500000, 50000)", "range(0, 0, 50000)")

# Add tidal spikes logic to passenger counts
tidal_logic = """
            boarding = random.randint(1, 15)
            alighting = random.randint(1, 15)
            
            # Tidal spikes
            if hour in [7, 8, 9]:
                boarding = int(boarding * 3.5)
            elif hour in [17, 18, 19]:
                alighting = int(alighting * 3.5)
            elif hour in [22, 23, 0, 1, 2, 3, 4]:
                boarding = int(boarding * 0.15)
                alighting = int(alighting * 0.15)
"""
content = re.sub(
    r"boarding = random\.randint\(1, 15\)\s+alighting = random\.randint\(1, 15\)",
    tidal_logic.strip(),
    content
)

with open("scripts/generate_exact_3m_mongo.py", "w") as f:
    f.write(content)
