import os
from dotenv import load_dotenv
from website import create_app

# Load environment variables when running via WSGI
load_dotenv()

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
