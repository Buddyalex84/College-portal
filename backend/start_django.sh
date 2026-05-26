#!/usr/bin/env bash
set -euo pipefail

# Resolve the directory this script lives in, so the command works
# no matter where it is invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Activate a local virtualenv if one exists.
if [ -d ".venv" ]; then
    # shellcheck disable=SC1091
    source ".venv/bin/activate"
fi

# Load variables from .env if it exists (ignore blanks and comments).
if [ -f ".env" ]; then
    set -a
    # shellcheck disable=SC1091
    source ".env"
    set +a
fi

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"

exec python manage.py runserver "${HOST}:${PORT}"
