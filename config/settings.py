from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal, List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    EXECUTION_MODE: Literal['DEVELOPMENT', 'COMPETITION'] = 'DEVELOPMENT'
    SUPABASE_URL: str = ''
    SUPABASE_ANON_KEY: str = ''
    SUPABASE_SERVICE_ROLE_KEY: str = ''
    JWT_SECRET_KEY: str = 'dev_secret_key_change_in_production'
    JWT_ALGORITHM: str = 'HS256'
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    SPARK_MASTER: str = 'local[*]'
    SPARK_APP_NAME: str = 'UrbanTransitIQ'
    SPARK_DRIVER_MEMORY: str = '2g'
    SPARK_EXECUTOR_MEMORY: str = '2g'
    HDFS_NAMENODE: str = 'hdfs://localhost:9000'
    HDFS_BASE_PATH: str = '/urbantransit'
    DATA_DIR: str = 'data'
    MODELS_DIR: str = 'models'
    REPORTS_DIR: str = 'reports'
    LOG_LEVEL: str = 'INFO'
    API_HOST: str = '0.0.0.0'
    API_PORT: int = 8000
    CORS_ORIGINS: List[str] = ['http://localhost:3000', 'http://127.0.0.1:3000']

settings = Settings()
