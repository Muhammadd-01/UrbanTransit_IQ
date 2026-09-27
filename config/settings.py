from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal, List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    EXECUTION_MODE: Literal['DEVELOPMENT', 'COMPETITION'] = 'DEVELOPMENT'

    # PostgreSQL
    DATABASE_URL: str = 'postgresql://urbantransit:UrbanTransit2026!@localhost:5433/urbantransit_iq'

    # MongoDB & Compass
    MONGO_URI: str = 'mongodb://localhost:27017'
    MONGO_DB_NAME: str = 'urbantransit_iq'

    # Authentication
    JWT_SECRET_KEY: str = 'dev_secret_key_change_in_production'
    JWT_ALGORITHM: str = 'HS256'
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ADMIN_EMAIL: str = 'affan@urbantransit.iq'
    ADMIN_PASSWORD: str = 'UrbanTransit2026!'
    ADMIN_FULL_NAME: str = 'Muhammad Affan'

    # Spark
    SPARK_MASTER: str = 'local[*]'
    SPARK_APP_NAME: str = 'UrbanTransitIQ'
    SPARK_DRIVER_MEMORY: str = '2g'
    SPARK_EXECUTOR_MEMORY: str = '2g'

    # HDFS
    HDFS_NAMENODE: str = 'hdfs://localhost:9000'
    HDFS_BASE_PATH: str = '/urbantransit'

    # Paths
    DATA_DIR: str = 'data'
    MODELS_DIR: str = 'models'
    REPORTS_DIR: str = 'reports'

    # Server
    LOG_LEVEL: str = 'INFO'
    API_HOST: str = '0.0.0.0'
    API_PORT: int = 8000
    CORS_ORIGINS: List[str] = ['http://localhost:3000', 'http://127.0.0.1:3000']

settings = Settings()
