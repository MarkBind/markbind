---
  layout: default.md
  title: "Testing guide"
  pageNav: 3
---

# Testing guide

<box type="tip">
This page can be used to understand the testing processes.
</box>

## Running tests

* **Method 1: Using script**
  * Create script for running tests in package.json
  * Open a console and run the command for the script, like `npm run test`

--------------------------------------------------------------------------------------------------------------------

## Types of tests

This project has two types of tests:

<panel header="**1. Unit tests**">
These tests target the lowest level methods/classes.<br>

Example command (replace with your own): `npm run test`
</panel>
<br>
<panel header="**2. Integration tests**">
These tests are checking the integration of multiple code units (those code units are assumed to be working).
</panel>
