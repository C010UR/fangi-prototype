#!/bin/sh

start_worker() {
  QUEUE_NAME=$1
  (while true; do
    echo "Starting messenger consumer for $QUEUE_NAME queue..."

    php bin/console messenger:consume $QUEUE_NAME --time-limit=3600 --memory-limit=256M --no-ansi --sleep=10
    EXIT_CODE=$?

    if [ $EXIT_CODE -eq 0 ]; then
      echo "$QUEUE_NAME worker terminated normally. Restarting..."
    else
      echo "$QUEUE_NAME worker failed with exit code $EXIT_CODE. Restarting..."
    fi

    sleep 1
  done) &
}

start_worker sqs_email
wait
