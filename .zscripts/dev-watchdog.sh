#!/bin/bash
# Restarts the dev server if it dies
while true; do
  bun run dev >> dev.log 2>&1
  echo "[$(date)] dev server exited, restarting in 3s..." >> dev.log
  sleep 3
done
