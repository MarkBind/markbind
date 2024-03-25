---
  layout: default.md
  title: "Tutorial: Tracing code"
  pageNav: 3
---

# Tutorial: Tracing code


> Indeed, the ratio of time spent reading versus writing is well over 10 to 1. We are constantly reading old code as part of the effort to write new code. …​\[Therefore,\] making it easy to read makes it easier to write.
>
> —  Robert C. Martin Clean Code: A Handbook of Agile Software Craftsmanship


<box type="tip">
This page can be taken as a reference on a tutorial on how to trace the execution path of a user command through the codebase of the App.
</box>

To understand an unfamiliar codebase, one strategy is to trace some representative execution path through the codebase using a debugger.


## Before we start

Before we jump into the code, it is useful to get an idea of the overall structure and the high-level behavior of the application.

<box type="tip">

Architecture diagrams can be easily utilised with the [`puml`](https://markbind.org/userGuide/components/imagesAndDiagrams.html#diagrams) tag. The `src` attribute specifies the path to the PlantUML file.
</box>

<puml src="../diagrams/example.puml" width=300 />

Before we proceed, ensure that you have done the following:
1. Read the [*Architecture* section of the DG](Design.html#architecture)
1. Set up the project in your preferred IDE

## Setting a breakpoint

As you know, the first step of debugging is to put in a breakpoint where you want the debugger to pause the execution.

<box type="tip">

**Tip:** You can use a combination of Markbind's [**Images and Diagrams** features](https://markbind.org/userGuide/components/imagesAndDiagrams.html) such as `puml` and `pic` tags to provide a visual representation of the steps to be taken. [**Code blocks**](https://markbind.org/userGuide/formattingContents.html#code) can also be used as shown below.
</box>


```java
public interface Example {
    /**
     * Executes returns the output.
     * @param exampleInput The input as entered by the user.
     * @return The example output.
     * @throws ExampleException If an error occurs.
     */
    ExampleOutput execute(String exampleInput) throws ExampleException;
...
}
```

## Tracing the execution path

<box type="tip">

**Tip:** You can use a list of steps to guide the reader through the process of tracing the execution path. This can be done using Markbind's [**Lists** feature](https://markbind.org/userGuide/formattingContents.html#lists).
</box>

1. Firstly, do this.

1. Next, do that.

1. Finally, do this.
