#!/bin/bash
cd /app/backend
export $(cat .env | xargs)
exec python manage.py runserver 0.0.0.0:8001
