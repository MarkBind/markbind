import json
import re
import sys

markdown_content = sys.argv[1]

# Preprocessing the markdown content
markdown_content = markdown_content.replace('`', '\\`')
markdown_content = markdown_content.replace('(', '\\(').replace(')', '\\)')
markdown_content = re.sub(r'<!--.*?-->', '', markdown_content, flags=re.DOTALL)  # Remove HTML comments

print(markdown_content)



