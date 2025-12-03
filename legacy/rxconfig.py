import reflex as rx
import os

config = rx.Config(
    app_name="app", 
    plugins=[rx.plugins.TailwindV3Plugin()],
    tailwind={
        "darkMode": "class",
    },
    # Production configuration
    # API_URL is provided by Reflex Cloud environment automatically, but we set a default
    api_url=os.getenv("API_URL"), 
    deploy_url=os.getenv("DEPLOY_URL"),
)
