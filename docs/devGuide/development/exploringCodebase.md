{% set title = "Exploring Codebase" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "{{ title }}"
  layout: devGuide.md
  pageNav: default
</frontmatter>

# {{ title }}

<div class="lead">
This page provides an overview of the MarkBind codebase and innovative methods to explore it as an onboarding developer.
</div>

## TL;DR

- [ ] Overarching structure of the MarkBind codebase
- [ ] Stepping through the codebase with a debugger
- [ ] Ingesting the codebase with LLMs

## Overarching Structure of the MarkBind Codebase

<panel src="{{baseUrl}}/devGuide/design/projectStructure.md#packages-overview" header="**Project Architecture**" type="info" no-close bottom-switch></panel>

<br>

## Debugger Setup

After setting up an experimental MarkBind site, you can step through the codebase with a debugger to understand the flow of the codebase.

<tabs>
<tab header="Visual Studio Code">

First, we will set up a **VS Code debug configuration**. This will allow us to configure and save setup details while debugging. If not already done so, set up a new `Node.js` debugger as shown below, which will create a new template `.vscode/launch.json` file for you to get started.

![]({{baseUrl}}/images/debugger/VSCode_1.jpg) {.ms-4}

Next, we will configure the `.vscode/launch.json` file to use some sample configurations as a baseline. These configurations specify specific application entry points as well as runtime arguments. Feel free to tweak them as you see fit. 
  
<panel header="Sample Config - Markbind Documentation as a development environment">

In this configuration, we simulate running `markbind serve -o -d` on MarkBind's documentation as a development environment. Here, notice we specify the following runtime arguments:
* the <a tags="environment--combined" href="/userGuide/cliCommands.html#serve-command">lazy reload`-o`</a><a tags="environment--dg" href="https://markbind.org/userGuide/cliCommands.html#serve-command">lazy reload`-o`</a> option to speed up page building
* the `-d` developer option. 

```json {.ms-4 heading="launch.json"}
{
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Dev Docs",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "cwd": "${workspaceFolder}/docs",
            "program": "${workspaceFolder}/packages/cli/index.js",
            "args": ["serve", "-o", "-d"]
        }
    ]
}
```
</panel>

<panel header="Sample Config - General Debugging of MarkBind Tests">

In this configuration, we will simulate running `npm run test` on MarkBind's packages. This allows us to step through the testing done in the various packages in MarkBind.

```json {.ms-4 heading="launch.json"}
{
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "test",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "cwd": "${workspaceFolder}",
            "runtimeExecutable": "npm",
            "runtimeArgs": ["run", "test"]
        }
    ]
}
```
</panel>

<panel header="Sample Config - Specific Debugging of MarkBind-CLI Package Tests">

In this configuration, we will simulate running `npm run test` on MarkBind's `CLI` package. Notice that the application entry point has been updated to reflect this. 

```json {.ms-4 heading="launch.json"}
{
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "test cli",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "cwd": "${workspaceFolder}/packages/cli",
            "runtimeExecutable": "npm",
            "runtimeArgs": ["run", "test"]
        }
    ]
}
```
</panel>

<br>

You can add **multiple configurations** as needed in debugging, each with their own respective application entry points, runtime arguments, and environment variables. 

![]({{baseUrl}}/images/debugger/VSCode_2.jpg) {.ms-4}

After setting up the appropriate configurations, **set up breakpoints** in your code to tell the debugger to pause execution when it reaches that line. You can set breakpoints by clicking in the gutter next to the line number in the editor. For more information about breakpoints, see [VSCode: Working with Breakpoints](https://code.visualstudio.com/docs/editor/debugging#_breakpoints).

Next, start a **debugging session** by selecting the desired debug configuration, and clicking run. 
* The Debug console at the bottom of the window will be displayed, which shows the debugging output. 
* The Debug toolbar at the top of the window allows you to control the flow of the debug session, such as stepping through code, pausing execution and stopping the session.
* The Variables section of the Run and Debug view allows inspection of variables and expressions relative to the selected stack frame in the Call Stack section.

![]({{baseUrl}}/images/debugger/VSCode_3.jpg) {.ms-4}

To **learn more** about debugging with Visual Studio Code, refer [here](https://code.visualstudio.com/docs/editor/debugging) for a more extensive official guide on debugging in VS Code. 

</tab>
<tab header="JetBrains IDEs">
    <box type="info">
        <markdown>Tested on JetBrains IDEs version `2024.1.1` and above.</markdown>
    </box>
    <markdown>1. Navigate to `Run` > `Edit Configurations...`.</markdown>
    <markdown>2. Click the `+` icon and select `Node.js`.</markdown>
    <markdown>3. Set the `Working directory` to the root of the MarkBind test site.</markdown>
    <box type="tip"><markdown>Set the `Working directory` to `markbind/docs` to experiment with the MarkBind documentation site.</markdown></box>
    <markdown>4. Set the `File` to the <trigger for="pop:absolute_path">**ABSOLUTE PATH**</trigger> of `packages/cli/index.js`.</markdown>
    <popover id="pop:absolute_path" content="e.g. ~/Documents/markbind/packages/cli/index.js"></popover>
    <markdown>5. Set the `Application parameters` to <trigger for="modal:serve-arguments" trigger="click">`serve -d -o`</trigger>.</markdown>
    <modal id="modal:serve-arguments" center large>
        <include src="{{baseUrl}}/userGuide/cliCommands.md#serve-command"></include>
    </modal>
    <markdown>6. Name the configuration and click `OK`.</markdown>
    <markdown>7. Add breakpoints to the lines you want to inspect.</markdown>
    <markdown>8. Select the configuration from the dropdown next to the "run" button and click the "debug" button to start tracing.</markdown>
</tab>
</tabs>

These steps should allow you to easily start debugging and gain deeper insights into MarkBind’s internal code flow and behavior. With breakpoints, step-through execution, and variable inspection, you will be able to:

* Understand how different parts of the code interact,
* Trace bugs or unexpected behavior more efficiently,
* Experiment with changes in a controlled environment.


## Ingesting the Codebase with LLMs

[//]: # (TODO: Add content)


