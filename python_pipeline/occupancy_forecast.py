import os
import json
import joblib
import pandas as pd
import logging
from xgboost import XGBRegressor
from .evaluation import evaluate_regressor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting occupancy forecast pipeline...")
    pass

if __name__ == '__main__':
    main()
