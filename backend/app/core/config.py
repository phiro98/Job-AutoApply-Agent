from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AutoApply Agent"
    GEMINI_API_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    SECRET_KEY: str = "super_secret_key"
    DATABASE_URL: str = "sqlite:///./autoapply.db"

    class Config:
        env_file = ".env"

settings = Settings()
