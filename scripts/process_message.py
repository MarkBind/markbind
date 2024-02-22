import json
import re
import sys

markdown_content = sys.argv[1]

# Preprocessing the markdown content
# add eof
markdown_content = markdown_content.replace('`', '\\`')
markdown_content = markdown_content.replace('\n', '\\n').replace('\r', '').replace('\t', '\\t')
markdown_content = markdown_content.replace('(', '\\(').replace(')', '\\)')
markdown_content = re.sub(r'<!--.*?-->', '', markdown_content, flags=re.DOTALL)  # Remove HTML comments
markdown_content = re.sub(r'^\s+', '', markdown_content, flags=re.MULTILINE)  # Trim leading whitespace
markdown_content = re.sub(r'\s+$', '', markdown_content, flags=re.MULTILINE)  # Trim trailing whitespace

print(markdown_content)



