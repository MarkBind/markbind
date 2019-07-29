This page contains some variables that are being imported in other files.
There should be only VARIABLES START and VARIABLES END in red:

<div style="color:red">
VARIABLES START

<variable name="var">This variable comes from variablesToImport.md</variable>

<variable name="pagevar">This is a page variable from variablestoimport.md</variable>

<import from="morevariablestoimport.md" as="namespace"/>

<variable name = "deepvar">

## Trying to access a page variable: 
There should be something red below:
<div style='color:red'>{{pagevar}}</div>
Something should have appeared above in red.

## Trying to access an imported variable via namespace: 
There should be something blue below:
<div style='color:blue'>{{namespace.variable}}</div>
Something should have appeared above in blue.
</variable>
VARIABLES END
</div>