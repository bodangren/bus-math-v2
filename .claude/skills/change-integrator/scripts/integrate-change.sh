#!/bin/bash
# This script finalizes a completed task by integrating approved specs and cleaning up branches.

set -e

# Ensure GH_TOKEN is set for GitHub CLI authentication
if [ -z "$GH_TOKEN" ]; then
    echo "Error: GH_TOKEN environment variable is not set." >&2
    echo "Please set it to a GitHub Personal Access Token with appropriate permissions (repo, project, read:user)." >&2
    echo "You can generate one at https://github.com/settings/tokens" >&2
    exit 1
fi

usage() {
    echo "Usage: $0 -p <pr-number> -b <branch-name> (-i <item-id> | -N <issue-number>) [-c <change-dir>]"
    echo "  -p: The number of the pull request that was merged."
    echo "  -b: The name of the feature branch that was merged."
    echo "  -i: The project board item ID for the task (GraphQL ID)."
    echo "  -N: The GitHub Issue Number for the task (e.g., 123)."
    echo "  -c: (Optional) The path to the original change proposal directory."
    exit 1
}

while getopts ":p:b:i:N:c:" opt; do
  case ${opt} in
    p ) PR_NUMBER=$OPTARG;; 
    b ) BRANCH_NAME=$OPTARG;; 
    i ) ITEM_ID=$OPTARG;; 
    N ) ISSUE_NUMBER=$OPTARG;; 
    c ) CHANGE_DIR=$OPTARG;; 
    \? ) echo "Invalid option: $OPTARG" 1>&2; usage;; 
    : ) echo "Invalid option: $OPTARG requires an argument" 1>&2; usage;; 
  esac
done

if [ -z "$PR_NUMBER" ] || [ -z "$BRANCH_NAME" ] || { [ -z "$ITEM_ID" ] && [ -z "$ISSUE_NUMBER" ]; }; then
    usage
fi

if [ -z "$ITEM_ID" ] && [ -n "$ISSUE_NUMBER" ]; then
    echo "Attempting to retrieve Project V2 Item ID for Issue #$ISSUE_NUMBER..."
    # GraphQL query to find the ProjectV2Item's ID by Issue number and Project ID
    GRAPHQL_QUERY=$(cat <<EOF
query {
  node(id: "$PROJECT_ID") {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldRepositoryFieldValue {
                repository {
                  nameWithOwner
                }
              }
              ... on ProjectV2ItemFieldIssueValue {
                issue {
                  number
                }
              }
            }
          }
        }
      }
    }
  }
}
EOF
)
    # Execute the GraphQL query and parse the JSON response
    ITEM_DATA=$(gh api graphql -F owner='$(gh repo view --json owner | jq -r ".owner.login")' -F repo='$(gh repo view --json name | jq -r ".name")' -f query="$GRAPHQL_QUERY")
    # Filter items to find the one linked to our issue number
    ITEM_ID=$(echo "$ITEM_DATA" | jq -r --arg ISSUE_NUMBER "$ISSUE_NUMBER" '.data.node.items.nodes[] | select(.fieldValues.nodes[]?.issue?.number == ($ISSUE_NUMBER | tonumber)) | .id')

    if [ -z "$ITEM_ID" ]; then
        echo "Error: Could not find Project V2 Item ID for Issue #$ISSUE_NUMBER in project $PROJECT_ID." >&2
        exit 1
    fi
    echo "Successfully retrieved Project V2 Item ID: $ITEM_ID for Issue #$ISSUE_NUMBER."
fi

# --- CONFIGURATION (should be detected dynamically in a future version) ---
# Project: Business Math v2
PROJECT_ID="PVT_kwHOARC_Ns4BHjGx"
FIELD_ID="PVTSSF_lAHOARC_Ns4BHjGxzg4RYRY" # Status
DONE_OPTION_ID="98236657"
RETRO_FILE="docs/RETROSPECTIVE.md"

echo "Starting complete-change workflow for PR #$PR_NUMBER..."

# 1. Verify PR is merged
echo "Verifying PR status..."
if ! gh pr view "$PR_NUMBER" --json state | grep -q '"state":"MERGED"'; then
    echo "Error: PR #$PR_NUMBER is not merged. Aborting." >&2
    exit 1
fi
echo "PR #$PR_NUMBER is confirmed as merged."

# 2. Checkout main and pull
echo "Switching to main and pulling latest changes..."
git checkout main
git pull

# 3. Delete merged branch
echo "Deleting merged branch: $BRANCH_NAME..."
git push origin --delete "$BRANCH_NAME" || echo "Remote branch $BRANCH_NAME may have already been deleted."
if git rev-parse --verify "$BRANCH_NAME" >/dev/null 2>&1; then
  git branch -D "$BRANCH_NAME"
else
  echo "Local branch $BRANCH_NAME not found, skipping delete."
fi

# 4. Integrate Spec (if a change directory was provided)
if [ -n "$CHANGE_DIR" ] && [ -d "$CHANGE_DIR" ]; then
    echo "Integrating spec files from $CHANGE_DIR..."
    # A more robust script would combine files; for now, we just move the delta.
    SPEC_FILE_NAME=$(basename "$CHANGE_DIR").md
    mv "$CHANGE_DIR/spec-delta.md" "docs/specs/$SPEC_FILE_NAME"
    rm -r "$CHANGE_DIR"
    git add docs/
git commit -m "docs: Integrate approved spec from $BRANCH_NAME"
else
    echo "No spec change directory provided or found, skipping spec integration."
fi

# 5. Update Project Board
echo "Updating project board for item $ITEM_ID..."
gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM_ID" --field-id "$FIELD_ID" --single-select-option-id "$DONE_OPTION_ID"

# 6. Update Retrospective
echo "Updating retrospective..."
# In a real implementation, this would be a more interactive process.
RETRO_ENTRY="### #$PR_NUMBER - $BRANCH_NAME\n\n- **Went well:** The auto-merge workflow completed successfully.\n- **Lesson:** N/A\n"
echo -e "\n$RETRO_ENTRY" >> "$RETRO_FILE"
git add "$RETRO_FILE"
git commit -m "docs: Add retrospective for PR #$PR_NUMBER"

# 7. Push final changes
echo "Pushing final integration commits..."
git push

echo "Complete-change workflow finished for PR #$PR_NUMBER."
