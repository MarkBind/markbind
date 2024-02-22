import json
import re
import sys

markdown_file_path = sys.argv[1]

with open(markdown_file_path, 'r', encoding='utf-8') as file:
    markdown_content = file.read()

# Preprocessing the markdown content
markdown_content = markdown_content.replace('`', '\\`')
markdown_content = markdown_content.replace('\n', '\\n').replace('\r', '').replace('\t', '\\t')
markdown_content = markdown_content.replace('(', '\\(').replace(')', '\\)')
markdown_content = re.sub(r'<!--.*?-->', '', markdown_content, flags=re.DOTALL)  # Remove HTML comments
markdown_content = re.sub(r'^\s+', '', markdown_content, flags=re.MULTILINE)  # Trim leading whitespace
markdown_content = re.sub(r'\s+$', '', markdown_content, flags=re.MULTILINE)  # Trim trailing whitespace

print(json.dumps({"content": markdown_content}))



