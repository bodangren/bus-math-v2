import sys
import os
import subprocess
import json
import re

def run_command_safe(args):
    """Runs a command as a list of arguments to avoid shell expansion issues."""
    try:
        # shell=False is default, which is safe
        result = subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {' '.join(args)}")
        print(e.stderr)
        sys.exit(1)

def get_repo_url():
    result = subprocess.run("git remote get-url origin", shell=True, check=True, stdout=subprocess.PIPE, text=True)
    return result.stdout.strip().replace("https://github.com/", "").replace(".git", "")

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 create_sprint_issues_rich.py <EPIC_NUMBER> <SPRINT_NAME>")
        sys.exit(1)

    epic_number = sys.argv[1]
    sprint_name = sys.argv[2]
    repo = get_repo_url()

    print(f"Planning Sprint: {sprint_name} for Epic #{epic_number}")

    # 1. Get Epic Details
    print("Fetching Epic details...")
    epic_json = run_command_safe(["gh", "issue", "view", epic_number, "--repo", repo, "--json", "body,title"])
    epic_data = json.loads(epic_json)
    epic_body = epic_data['body']

    # 2. Find Spec File
    match = re.search(r"docs/specs/[^ \n`]*tasks\.md", epic_body)
    if not match:
        print("Error: Could not find 'tasks.md' path in Epic body.")
        sys.exit(1)
    
    tasks_file_path = match.group(0)
    spec_dir = os.path.dirname(tasks_file_path)
    spec_delta_path = os.path.join(spec_dir, "spec-delta.md")

    print(f"Found Tasks File: {tasks_file_path}")

    if not os.path.exists(tasks_file_path):
        print(f"Error: File {tasks_file_path} does not exist.")
        sys.exit(1)

    # 3. Read Context
    context_content = ""
    if os.path.exists(spec_delta_path):
        with open(spec_delta_path, 'r') as f:
            context_content = f.read()
    else:
        print("Warning: spec-delta.md not found. Issues will lack detailed context.")

    # 4. Parse Tasks
    with open(tasks_file_path, 'r') as f:
        lines = f.readlines()

    current_phase = "General"
    current_task = None
    current_subtasks = []

    tasks = []

    for line in lines:
        line = line.rstrip()
        
        # Detect Phase Headers
        if line.startswith("## "):
            current_phase = line.replace("## ", "").strip()
            continue

        # Detect Main Tasks "- [ ] Task Name"
        # Use regex to ensure we only catch top-level bullets (no leading spaces)
        task_match = re.match(r"^-\s*\[\s*\]\s*(.*)", line)
        if task_match:
            # Save previous task
            if current_task:
                tasks.append({
                    "title": current_task,
                    "phase": current_phase,
                    "subtasks": current_subtasks
                })
            
            # Start new task
            current_task = task_match.group(1)
            current_subtasks = []
        
        # Detect Subtasks "    - [ ] Subtask"
        elif current_task and re.match(r"^\s+-\s*\[\s*\]\s*(.*)", line):
            sub_match = re.match(r"^\s+-\s*\[\s*\]\s*(.*)", line)
            current_subtasks.append(sub_match.group(1))

    # Append last task
    if current_task:
        tasks.append({
            "title": current_task,
            "phase": current_phase,
            "subtasks": current_subtasks
        })

    # 5. Create Issues
    print(f"Found {len(tasks)} tasks. Creating GitHub issues...")

    for task in tasks:
        title = f"TASK: {task['title']}"
        
        # Construct Rich Body
        body = f"""## Description
{task['title']}

**Phase**: {task['phase']}

"""
        if task['subtasks']:
            body += "## Implementation Steps\n"
            for sub in task['subtasks']:
                body += f"- [ ] {sub}\n"
            body += "\n"

        body += f"""## Context & Spec
*From Spec*: `{tasks_file_path}`
*Parent Epic*: #{epic_number}

<details>
<summary><strong>Full Specification Reference</strong></summary>

{context_content}

</details>
"""
        
        print(f"Creating: {title}")
        
        # Write body to temp file
        with open("temp_issue_body.md", "w") as temp_f:
            temp_f.write(body)

        # Execute with list args to PREVENT SHELL EXPANSION of backticks
        run_command_safe([
            "gh", "issue", "create",
            "--repo", repo,
            "--title", title,
            "--body-file", "temp_issue_body.md",
            "--milestone", sprint_name
        ])
        
        os.remove("temp_issue_body.md")

    print("Done!")

if __name__ == "__main__":
    main()