#!/bin/bash
# This script idempotently creates or updates a SynthesisFlow agent guide in a markdown file.

set -e

usage() {
    echo "Usage: $0 [-f <filepath>]"
    echo "  -f <filepath>: The path to the markdown file to update. Defaults to AGENTS.md in the project root."
    exit 1
}

TARGET_FILE="AGENTS.md"

while getopts ":f:" opt; do
  case ${opt} in
    f )
      TARGET_FILE=$OPTARG
      ;;
    \? )
      echo "Invalid option: $OPTARG" 1>&2
      usage
      ;;
    : )
      echo "Invalid option: $OPTARG requires an argument" 1>&2
      usage
      ;;
  esac
done

# Define the static part of the content block
AGENT_CONTENT_START="<!-- SYNTHESIS_FLOW_START -->
# SynthesisFlow Agent Guide

This project uses SynthesisFlow, a modular, spec-driven development methodology. The workflow is broken down into several discrete skills located in the \`.claude/skills/\` directory.

## Core Philosophy
1.  **Specs as Code:** All specification changes are proposed and approved via Pull Requests.
2.  **Just-in-Time Context:** Use the \`doc-indexer\` skill to get a real-time map of all project documentation.
3.  **Sprint-Based:** Work is organized into GitHub Milestones and planned via the \`sprint-planner\` skill.
4.  **Atomic Issues:** Implementation is done via atomic GitHub Issues, which are executed by the \`issue-executor\` skill.
5.  **Hybrid Architecture:** LLM executes workflow steps with strategic reasoning, helper scripts automate repetitive tasks.
6.  **Use Subagents:** Use subagents for the various skills whenever possible and act as an orchstrator for most tasks of any real size.

## Available Skillsets

Each skill contains comprehensive documentation in \`SKILL.md\` explaining purpose, workflow, and error handling. Helper scripts are located in each skill's \`scripts/\` directory.

\`\`\`
.
└── .claude/
    └── skills/"

AGENT_CONTENT_END="
\`\`\`

To begin, always assess the current state by checking the git branch and running the \`doc-indexer\`.
<!-- SYNTHESIS_FLOW_END -->"

# Dynamically generate the skill tree
SKILL_TREE=""
SKILLS_DIR=".claude/skills"
if [ -d "$SKILLS_DIR" ]; then
    SKILL_DIRS=($SKILLS_DIR/*/)
    for i in "${!SKILL_DIRS[@]}"; do
        skill_dir=${SKILL_DIRS[$i]}
        skill_name=$(basename "$skill_dir")
        SKILL_MD_PATH="$skill_dir/SKILL.md"
        
        description="No description found."
        if [ -f "$SKILL_MD_PATH" ]; then
            # Extract description from YAML frontmatter
            description=$(grep '^description:' "$SKILL_MD_PATH" | sed 's/description: //')
        fi

        if [ $i -eq $((${#SKILL_DIRS[@]} - 1)) ]; then
            # Last item
            SKILL_TREE="${SKILL_TREE}        └── ${skill_name}/ — ${description}"
        else
            # Not last item
            SKILL_TREE="${SKILL_TREE}        ├── ${skill_name}/ — ${description}\n"
        fi
    done
fi

# Combine all parts
AGENT_CONTENT="${AGENT_CONTENT_START}\n${SKILL_TREE}\n${AGENT_CONTENT_END}"


# Ensure the target file exists
touch "$TARGET_FILE"

# Check if the markers exist in the file
if grep -q "<!-- SYNTHESIS_FLOW_START -->" "$TARGET_FILE"; then
    echo "Updating existing SynthesisFlow guide in $TARGET_FILE..."
    # Use awk to replace the content between the markers
    awk -v content="$AGENT_CONTENT" ' 
        /<!-- SYNTHESIS_FLOW_START -->/ { print content; in_block=1 }
        /<!-- SYNTHESIS_FLOW_END -->/ { in_block=0; next }
        !in_block { print }
    ' "$TARGET_FILE" > "${TARGET_FILE}.tmp" && mv "${TARGET_FILE}.tmp" "$TARGET_FILE"
else
    echo "Adding SynthesisFlow guide to $TARGET_FILE..."
    # Append the content to the end of the file
    echo -e "\n$AGENT_CONTENT" >> "$TARGET_FILE"
fi

echo "$TARGET_FILE has been updated successfully."