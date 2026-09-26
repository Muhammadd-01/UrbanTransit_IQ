import os
import re

analytics_file = "/Users/muhammadaffan/Coding/UrbanTransit_IQ/backend/app/analytics/db_analytics.py"
with open(analytics_file, "r") as f:
    content = f.read()

# Add apply_filters function at the top
apply_func = """
def apply_filters(q, model, filters):
    if not filters: return q
    if "route_id" in filters and hasattr(model, "route_id"):
        q = q.filter(model.route_id == filters["route_id"])
    if "date" in filters and hasattr(model, "timestamp"):
        # Very simple date string matching
        q = q.filter(func.date(model.timestamp) == filters["date"])
    return q
"""

if "def apply_filters" not in content:
    content = content.replace("logger = logging.getLogger(__name__)", "logger = logging.getLogger(__name__)\n" + apply_func)

# We can dynamically inject apply_filters(..., model, filters) 
# Example: q = db.query(Ticket.boarding_stop, ...) -> q = apply_filters(db.query(Ticket.boarding_stop, ...), Ticket, filters)
# It's tricky with regex. Instead of modifying python files via regex, let's just modify the API layer to use a dependency that overrides the queries? 
# Or we just modify PassengerFlow.jsx and Dashboard.jsx to send the filters in API and implement them in backend for passenger_flow.py and db_analytics.py manually for the main queries.
