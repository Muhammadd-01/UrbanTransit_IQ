import json
import os

def save_spark_model(model, path, metadata_dict=None):
    """Saves a Spark ML model to disk along with metadata."""
    model.write().overwrite().save(path)
    if metadata_dict:
        meta_path = os.path.join(path, "metadata.json")
        with open(meta_path, 'w') as f:
            json.dump(metadata_dict, f, indent=4)

def load_spark_model(path, model_class):
    """Loads a Spark ML model from disk."""
    return model_class.load(path)

def save_metrics(metrics_dict, path):
    """Saves metrics to a JSON file."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(metrics_dict, f, indent=4)

def load_metrics(path):
    """Loads metrics from a JSON file."""
    with open(path, 'r') as f:
        return json.load(f)
