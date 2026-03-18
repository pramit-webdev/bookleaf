#!/bin/bash
pkill -f uvicorn || true
sleep 2
source venv/bin/activate
export PYTHONPATH=$PYTHONPATH:.
nohup uvicorn app.main:app --host 127.0.0.1 --port 8000 > server.log 2>&1 &
SERVER_PID=$!
sleep 5
curl -s http://127.0.0.1:8000/Health
python3 scripts/final_brand_new_audit.py
kill -9 $SERVER_PID
pkill -f uvicorn
