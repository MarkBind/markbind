---
  layout: default.md
  title: "Testing guide"
  pageNav: 3
---

# Testing guide

<!-- * Table of Contents -->
<page-nav-print />

<!-- -------------------------------------------------------------------------------------------------------------------- -->

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
<p>These tests are targeting the lowest level methods/classes.</p>
</panel>
<br>
<panel header="**2. Integration tests**">
<p>These tests are checking the integration of multiple code units (those code units are assumed to be working).</p>
</panel>
