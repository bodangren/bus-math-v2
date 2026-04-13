#!/bin/zsh

# Configuration variables
WORK_MODEL="minimax-cn-coding-plan/MiniMax-M2.7"
REVIEW_MODEL="xiaomi/mimo-v2-pro"
WORKING_DIR="/Users/daniel.bodanske/Desktop/bus-math-v2"
OPENCODE_PATH="/Users/daniel.bodanske/.nvm/versions/node/v20.14.0/bin/opencode"
PROMPT_FILE="$WORKING_DIR/conductor/autonomous-prompt.md"
WORK_SLEEP_TIME=1800
REVIEW_SLEEP_TIME=120
WORK_SESSIONS=4
SESSION_TIMEOUT=3600  # 60 minutes in seconds

# Function to run a command with timeout
run_with_timeout() {
  local cmd="$1"
  local timeout=$SESSION_TIMEOUT
  local start_time=$(date +%s)
  
  # Run command in background
  eval "$cmd" &
  local pid=$!
  
  # Wait for command to complete or timeout
  while true; do
    # Check if process is still running
    if ! kill -0 $pid 2>/dev/null; then
      # Process has exited
      wait $pid
      return $?
    fi
    
    # Check if timeout has been reached
    local current_time=$(date +%s)
    local elapsed=$((current_time - start_time))
    
    if [ $elapsed -ge $timeout ]; then
      # Timeout reached, kill the process
      echo "Session timeout reached ($timeout seconds), killing process $pid"
      kill -9 $pid 2>/dev/null
      wait $pid 2>/dev/null
      return 124  # Same exit code as timeout command
    fi
    
    # Sleep for a bit before checking again
    sleep 30
  done
}

while true 
do
  # Run work sessions
  for i in $(seq 1 $WORK_SESSIONS); do
    run_with_timeout "$OPENCODE_PATH \
      run \"/conductor @AGENTS.md Use the conductor skill to complete one enitre phase of the current or next track. Always sync with remote and deal with conflicts intelligently. If workspace has some documentation updates or previous edits, simply commit those before starting work. Work autonomously without any guidance from the user until the phase is complete. Make sure to run tests, npm run build (fixing any blockers, whether your code or not), then commit with note and push.\" \
      --dir \"$WORKING_DIR\" \
      -m \"$WORK_MODEL\" \
      -f \"$PROMPT_FILE\""
    
    if [ $i -lt $WORK_SESSIONS ]; then
      sleep $WORK_SLEEP_TIME
    fi
  done
  
  # Run review session
  run_with_timeout "$OPENCODE_PATH \
    run \"/conductor @AGENTS.md You are an expert code-review consultant brought in to audit the past few phases -- two or three, depending on how long its been since the last review. Always sync with remote and deal with conflicts intelligently. If workspace has some documentation updates or previous edits, simply commit those before starting work. Work autonomously without any guidance from the user until the code review is complete. Fix any serious issues you find. Record all issues in the appropriate conductor/ docs.  Make sure to run tests, npm run build (fixing any blockers, whether your code or not), update conductor/current_directive.md with next high-level priorities, check README.md for correctness, then commit with note and push.\" \
    --dir \"$WORKING_DIR\" \
    -m \"$REVIEW_MODEL\""
  
  sleep $REVIEW_SLEEP_TIME
done
