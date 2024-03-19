import json

# Path to your markdown file
markdown_file_path = '.github/PULL_REQUEST_TEMPLATE'

# Read the markdown file content
with open(markdown_file_path, 'r', encoding='utf-8') as file:
    markdown_content = file.read()

# Convert markdown content to JSON format
json_payload = {
    "pull_request": {
        "body": markdown_content,
        "base": {
            "ref": "master"
        },
        "merged": True
    }
}

# Convert Python dictionary to JSON string
json_string = json.dumps(json_payload, ensure_ascii=False)

# Output or save the JSON string as needed
# print(json_string)
#save to delete.json
with open('delete.json', 'w', encoding='utf-8') as file:
    file.write(json_string)