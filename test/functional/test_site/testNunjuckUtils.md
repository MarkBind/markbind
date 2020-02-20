{%raw%}

The standard trick to render braces still works {<span>{ content }</span>}.

Nonexistent variables should still be removed: {{ unknown_variable }}. In the rare event that user wrapped an unknown variable inside a raw tag, it should retain its current behaviour and not be produced to ensure Vue does not break.

{%endraw%}