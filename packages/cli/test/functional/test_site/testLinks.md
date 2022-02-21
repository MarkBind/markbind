# Autolinks
A URL with `http(s)://` head or an email address in plain text will be auto converted into clickable links.

This functionality is inherited from markdown-it, with the setting of `fuzzyLink` turned off.

**These will be converted:**

https://www.google.com

https://markbind.org

foobar@gmail.com

**These will not be converted:**

google.com

markbind.org

foo@bar

**Tricks to prevent autolink:**

`https://markbind.org`

https://<span></span>markbind.org