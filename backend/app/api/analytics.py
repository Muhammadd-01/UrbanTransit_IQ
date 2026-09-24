from fastapi import APIRouter
from backend.app.analytics.passenger_flow import analyze_passenger_flow
from backend.app.analytics.od_analysis import get_od_matrix
from backend.app.analytics.peak_detection import detect_peaks
from backend.app.analytics.overcrowding import detect_overcrowding
from backend.app.analytics.underutilization import detect_underutilization
from backend.app.analytics.route_performance import calculate_route_performance
from backend.app.analytics.delay_analysis import analyze_delays
from backend.app.analytics.headway import analyze_headway
from backend.app.analytics.vehicle_utilization import analyze_vehicle_utilization
from backend.app.analytics.bottleneck import detect_bottlenecks

router = APIRouter()

@router.get("/passenger-flow")
async def passenger_flow():
    return analyze_passenger_flow()

@router.get("/od-matrix")
async def od_matrix():
    return get_od_matrix()

@router.get("/peak-detection")
async def peak_detection():
    return detect_peaks()

@router.get("/overcrowding")
async def overcrowding():
    return detect_overcrowding()

@router.get("/underutilization")
async def underutilization():
    return detect_underutilization()

@router.get("/route-performance")
async def route_performance():
    return calculate_route_performance()

@router.get("/delays")
async def delays():
    return analyze_delays()

@router.get("/occupancy")
async def occupancy():
    return {
        "status": "success",
        "average_network_occupancy": 0.74,
        "peak_occupancy": 0.94,
        "distribution": {
            "Low (<50%)": 24.5,
            "Moderate (50-70%)": 32.1,
            "High (70-85%)": 28.4,
            "Overcrowded (85-95%)": 11.2,
            "Critical (>95%)": 3.8
        }
    }

@router.get("/headway")
async def headway():
    return analyze_headway()

@router.get("/vehicle-bunching")
async def vehicle_bunching():
    return analyze_headway()

@router.get("/vehicle-utilization")
async def vehicle_utilization():
    return analyze_vehicle_utilization()

@router.get("/bottlenecks")
async def bottlenecks():
    return detect_bottlenecks()
