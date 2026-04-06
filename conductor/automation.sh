#!/bin/zsh
while true 
do /Users/daniel.bodanske/.nvm/versions/node/v20.14.0/bin/opencode \
  run "/conductor @AGENTS.md Use the conductor skill to complete one enitre phase of the current or next track. Always sync with remote and deal with conflicts intelligently. If workspace has some documentation updates or previous edits, simply commit those before starting work. Work autonomously without any guidance from the user until the phase is complete. Make sure to run tests, npm run build (fixing any blockers, whether your code or not), then commit with note and push." \
  --dir /Users/daniel.bodanske/Desktop/bus-math-v2 \
  -m xiaomi/mimo-v2-pro \
  -f /Users/daniel.bodanske/Desktop/bus-math-v2/conductor/autonomous-prompt.md \
  --pure
sleep 4800
/Users/daniel.bodanske/.nvm/versions/node/v20.14.0/bin/opencode \
  run "/conductor @AGENTS.md Use the conductor skill to complete one enitre phase of the current or next track. Always sync with remote and deal with conflicts intelligently. If workspace has some documentation updates or previous edits, simply commit those before starting work. Work autonomously without any guidance from the user until the phase is complete. Make sure to run tests, npm run build (fixing any blockers, whether your code or not), then commit with note and push." \
  --dir /Users/daniel.bodanske/Desktop/bus-math-v2 \
  -m xiaomi/mimo-v2-pro \
  -f /Users/daniel.bodanske/desktop/bus-math-v2/conductor/autonomous-prompt.md \
  --pure
sleep 3600
/Users/daniel.bodanske/.nvm/versions/node/v20.14.0/bin/opencode \
  run "/conductor @AGENTS.md You are an expert code-review consultant brought in to audit the past few phases -- two or three, depending on how long its been since the last review. Always sync with remote and deal with conflicts intelligently. If workspace has some documentation updates or previous edits, simply commit those before starting work. Work autonomously without any guidance from the user until the code review is complete. Fix any serious issues you find. Record all issues in the appropriate conductor/ docs.  Make sure to run tests, npm run build (fixing any blockers, whether your code or not),  update conductor/current_directive.md with next high-level priorities, then commit with note and push." \
  --dir /Users/daniel.bodanske/Desktop/bus-math-v2 \
  -m zai-coding-plan/glm-5.1 \
  --pure
sleep 1200
done
