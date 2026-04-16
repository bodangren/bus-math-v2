#!/bin/zsh

# Configuration variables
OPENCODE_WORK_MODEL="minimax-cn-coding-plan/MiniMax-M2.7"
KIMI_WORK_MODEL="kimi-for-coding/k2p5"
REVIEW_MODEL_A="xiaomi/mimo-v2-pro"
REVIEW_MODEL_B="zai-coding-plan/glm-5.1"
WORKING_DIR="/Users/daniel.bodanske/Desktop/bus-math-v2"
OPENCODE_PATH="/Users/daniel.bodanske/.nvm/versions/node/v20.14.0/bin/opencode"
PROMPT_FILE="$WORKING_DIR/conductor/autonomous-prompt.md"
WORK_SLEEP_TIME=600
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

USE_REVIEW_A=1

while true 
do
  # Run work sessions through opencode, alternating work models.
  for i in $(seq 1 $WORK_SESSIONS); do
    if (( i % 2 == 1 )); then
      # Odd sessions: opencode with MiniMax-M2.7
      run_with_timeout "$OPENCODE_PATH \
        run \"$WORK_PROMPT\" \
        --dir \"$WORKING_DIR\" \
        -m \"$OPENCODE_WORK_MODEL\" \
        -f \"$PROMPT_FILE\""
    else
      # Even sessions: opencode with Kimi K2.5
      run_with_timeout "$OPENCODE_PATH \
        run \"$WORK_PROMPT\" \
        --dir \"$WORKING_DIR\" \
        -m \"$KIMI_WORK_MODEL\" \
        -f \"$PROMPT_FILE\""
    fi
    
    if [ $i -lt $WORK_SESSIONS ]; then
      sleep $WORK_SLEEP_TIME
    fi
  done
  
  # Toggle review model
  if [ $USE_REVIEW_A -eq 1 ]; then
    CURRENT_REVIEW_MODEL="$REVIEW_MODEL_A"
    USE_REVIEW_A=0
  else
    CURRENT_REVIEW_MODEL="$REVIEW_MODEL_B"
    USE_REVIEW_A=1
  fi

  # Run review session
  run_with_timeout "$OPENCODE_PATH \
    run \"$REVIEW_PROMPT\" \
    --dir \"$WORKING_DIR\" \
    -m \"$CURRENT_REVIEW_MODEL\""
  
  sleep $REVIEW_SLEEP_TIME
done
