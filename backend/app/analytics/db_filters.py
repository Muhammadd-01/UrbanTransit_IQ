from typing import Dict, Any
from sqlalchemy.orm import Query
from sqlalchemy import func

def apply_global_filters(query: Query, filters: Dict[str, Any]) -> Query:
    if not filters:
        return query
        
    # Get all entities involved in the query
    entities = []
    for desc in query.column_descriptions:
        if desc['entity']:
            entities.append(desc['entity'])
        elif desc['type'] and hasattr(desc['type'], '__name__'):
            # Sometimes it's a column or function, we can try to extract the class
            if hasattr(desc['expr'], 'class_'):
                entities.append(desc['expr'].class_)
                
    # Remove duplicates
    entities = list(set(entities))
    
    if not entities:
        return query
        
    route_id = filters.get("route_id") or filters.get("routeId")
    date_start = filters.get("dateStart")
    hour = filters.get("hour")
    is_peak = filters.get("isPeak")
    
    for model in entities:
        if route_id and hasattr(model, "route_id"):
            query = query.filter(model.route_id == route_id)
        if date_start and hasattr(model, "timestamp"):
            query = query.filter(func.date(model.timestamp) >= date_start)
        if hour is not None and hasattr(model, "timestamp"):
            query = query.filter(func.extract('hour', model.timestamp) == int(hour))
            
    return query
