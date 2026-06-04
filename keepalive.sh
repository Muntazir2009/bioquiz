#!/bin/bash
while true; do
  cd /home/z/my-project
  bun run dev &
  DEV_PID=$!
  # Wait for the process to exit
  wait $DEV_PID 2>/dev/null
  echo "Dev server exited, restarting in 2 seconds..."
  sleep 2
done
