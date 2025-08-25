import os
from dotenv import load_dotenv

load_dotenv()

NEO4J_URI = os.environ.get("NEO4J_URI")
NEO4J_USERNAME = os.environ.get("NEO4J_USERNAME")
NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")  # Gemini API

if not all([NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, OPENAI_API_KEY]):
    raise ValueError(
        "NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, OPEN_API_KEY deben estar definidos en .env"
    )
