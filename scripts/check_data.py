import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.database.engine import SessionLocal
from backend.app.database.models import PassengerCount, Ticket, Passenger, Delay
from sqlalchemy import func

def check_data():
    with SessionLocal() as db:
        passengers = db.query(func.count(Passenger.passenger_id)).scalar()
        null_tickets = db.query(func.count(Ticket.ticket_id)).filter(Ticket.trip_id == None).scalar()
        null_counts = db.query(func.count(PassengerCount.id)).filter(PassengerCount.timestamp == None).scalar()
        avg_delays = db.query(func.avg(Delay.delay_minutes)).scalar()
        
        print(f"Total Passengers in DB: {passengers}")
        print(f"Null Trip IDs in Tickets: {null_tickets}")
        print(f"Null Timestamps in PassengerCounts: {null_counts}")
        print(f"Average Delay (minutes): {avg_delays:.2f}")

if __name__ == "__main__":
    check_data()
