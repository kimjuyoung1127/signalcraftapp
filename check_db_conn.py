import socket
import sys
import os

host = os.getenv("DB_HOST", "host.docker.internal")
port = int(os.getenv("DB_PORT", "5432"))

print(f"Attempting to connect to {host}:{port}...")

try:
    s = socket.create_connection((host, port), timeout=5)
    s.close()
    print(f"Connection to {host}:{port} successful.")
    sys.exit(0)
except socket.timeout:
    print(f"Connection to {host}:{port} timed out.")
    sys.exit(1)
except ConnectionRefusedError:
    print(f"Connection to {host}:{port} refused. Is the database running and accessible?")
    sys.exit(1)
except Exception as e:
    print(f"An unexpected error occurred: {e}")
    sys.exit(1)