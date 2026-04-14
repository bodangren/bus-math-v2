#!/bin/zsh

# Configuration variables
OPENCODE_WORK_MODEL="minimax-cn-coding-plan/MiniMax-M2.7"
KIMI_WORK_MODEL="k2.5"
REVIEW_MODEL="xiaomi/mimo-v2-pro"
WORKING_DIR="/Users/daniel.bodanske/Desktop/bus-math-v2"
OPENCODE_PATH="/Users/daniel.bodanske/.nvm/versions/node/v20.14.0/bin/opencode"
KIMI_PATH="/Users/daniel.bodanske/.local/bin/kimi"
PROMPT_FILE="$WORKING_DIR/conductor/autonomous-prompt.md"
WORK_SLEEP_TIME=3600
REVIEW_SLEEP_TIME=120
WORK_SESSIONS=6
SESSION_TIMEOUT=3600  # 60 minutes in seconds

WORK_PROMPT="/conductor @AGENTS.md Use the conductor skill to complete one entire phase of the current or next track. Always sync with remote and deal with conflicts intelligently. If workspace has some documentation updates or previous edits, simply commit those before starting work. Work autonomously without any guidance from the user until the phase is complete. Make sure to run tests, npm run build (fixing any blockers, whether your code or not), then commit with note and push."

REVIEW_PROMPT="/conductor @AGENTS.md You are an expert code-review consultant brought in to audit the past few phases -- two or three, depending on how long its been since the last review. Always sync with remote and deal with conflicts intelligently. If workspace has some documentation updates or previous edits, simply commit those before starting work. Work autonomously without any guidance from the user until the code review is complete. Fix any serious issues you find. Record all issues in the appropriate conductor/ docs.  Make sure to run tests, npm run build (fixing any blockers, whether your code or not), update conductor/current_directive.md with next high-level priorities, check README.md for correctness, then commit with note and push."

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
  # Run work sessions (alternate opencode and kimi)
  for i in $(seq 1 $WORK_SESSIONS); do
    if (( i % 2 == 1 )); then
      # Odd sessions: opencode with MiniMax-M2.7
      run_with_timeout "$OPENCODE_PATH \
        run \"$WORK_PROMPT\" \
        --dir \"$WORKING_DIR\" \
        -m \"$OPENCODE_WORK_MODEL\" \
        -f \"$PROMPT_FILE\""
    else
      # Even sessions: kimi with k2.5
      KIMI_PROMPT_TEXT="$(cat "$PROMPT_FILE")"$'\n\n'"$WORK_PROMPT"
      run_with_timeout "$KIMI_PATH \
        --print \
        -w \"$WORKING_DIR\" \
        -m \"$KIMI_WORK_MODEL\" \
        -p ${(q)KIMI_PROMPT_TEXT}"
    fi
    
    if [ $i -lt $WORK_SESSIONS ]; then
      sleep $WORK_SLEEP_TIME
    fi
  done
  
  # Run review session
  run_with_timeout "$OPENCODE_PATH \
    run \"$REVIEW_PROMPT\" \
    --dir \"$WORKING_DIR\" \
    -m \"$REVIEW_MODEL\""
  
  sleep $REVIEW_SLEEP_TIME
done
