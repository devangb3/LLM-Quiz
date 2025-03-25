import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY")
    DEEPSEEK_API_URL: str = "https://api.deepseek.com/v1/chat/completions"
    
    # CORS Settings
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # API Settings
    MODEL_NAME: str = "deepseek-chat"
    MAX_TOKENS: int = 20000 
    TEMPERATURE: float = 0.1

settings = Settings() 