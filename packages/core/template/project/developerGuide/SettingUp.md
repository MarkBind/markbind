---
  layout: default.md
  title: "Setting up and getting started"
  pageNav: 3
---

# Setting up and getting started

--------------------------------------------------------------------------------------------------------------------

<box type="tip">
This page can be used to help developers with setting up the project in their local environment.
</box>

## Setting up the project in your computer

<box type="warning" seamless>

**Caution:**
Follow the steps in the following guide precisely. Things will not work out if you deviate in some steps.
</box>

First, **fork** the project repo, and **clone** the fork into your computer.

<popover id="pop:trigger_id" content="eg. `init` or `build` commands"></popover>
(Example) Steps to setup the project environment:
1. **Download packages**: Run `npm install` to download the required packages.
1. **Run setup commands**: Run <trigger for="pop:trigger_id">commands</trigger> needed to setup the project.
   <box type="warning" seamless>
   Note: Remember to run commands from the appropriate directory.
   </box>
1. **Configure files**: Edit config files according to your needs. For example, changing the `appTitle` in `config.js` to match your project name.
1. **Verify the setup (optional)**:
   1. Run the `build` and `serve` commands, ensuring that the site properly deploys on your local host.
   1. [Run the tests](Testing.md) to ensure they all pass.

--------------------------------------------------------------------------------------------------------------------

## Before writing code

1. **Configure the coding style**

   Configure your VSCode or IDEA checkstyle to allign with the project's coding style.

   <box type="tip" seamless>

   **Tip:**
   You can easily customize your IDE's coding style through settings.
   </box>

1. **Set up CI**

   This project comes with a GitHub Actions config files (in `.github/workflows` folder). When GitHub detects those files, it will run the CI for your project automatically at each push to the `master` branch or to any PR. No set up required.

1. **Learn the design**

   When you are ready to start coding, we recommend that you get some sense of the overall design by reading about [ProjectEx’s architecture](Design.md#Architecture).

1. **Do the tutorial**

   The [Tracing Code tutorial](TracingCode.md) can help you get acquainted with the codebase.

   
