# UrbanTransit IQ — Dataset Generation Manual
Details the synthetic generation engine for Karachi's transit network.
Located in `data_generator/`.

## Execution
```bash
python data_generator/generate_data.py --scale small
python data_generator/generate_data.py --scale medium
python data_generator/generate_data.py --scale competition
```

## Generated Scale Profile
- Small: ~50K passenger records, 20 routes, 100 stops, 50 vehicles, 3 months.
- Medium: ~500K passenger records, 50 routes, 250 stops, 100 vehicles, 6 months.
- Competition: ~2,000,000+ movement records, 110 routes, 520 stops, 260 vehicles, 12 months.
