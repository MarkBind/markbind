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
This page can be taken as a reference on a tutorial on how to trace the execution path of a user command through the code base of the App.
</box>

When trying to understand an unfamiliar code base, one common strategy used is to trace some representative execution path through the code base. One easy way to trace an execution path is to use a debugger to step through the code. In this tutorial, you will be using the IntelliJ IDEA’s debugger to trace the execution path of a specific feature.

<!-- * Table of Contents -->
<!-- {:toc} -->

## Before we start

Before we jump into the code, it is useful to get an idea of the overall structure and the high-level behavior of the application. This is provided in the 'Architecture' section of the developer guide. In particular, the architecture diagram (reproduced below), tells us that the App consists of several components.

<box type="tip" seamless>

Architecture diagrams can be easily utilised with the [`puml`](https://markbind.org/userGuide/components/imagesAndDiagrams.html#diagrams) tag. The `src` attribute specifies the path to the PlantUML file.
</box>

<puml src="../diagrams/ArchitectureDiagram.puml" alt="ArchitectureDiagram" />

It also has a sequence diagram (reproduced below) that tells us how a command propagates through the App.

<puml src="../diagrams/ArchitectureSequenceDiagram.puml" width="550" />

Before we proceed, ensure that you have done the following:
1. Read the [*Architecture* section of the DG](../DeveloperGuide.md#architecture)
1. Set up the project in Intellij IDEA
1. Learn basic debugging features of Intellij IDEA
   * If you are using a different IDE, we'll leave it to you to figure out the equivalent feature to use in your IDE.
   * If you are not using an IDE, we'll let you figure out how to achieve the same using your coding toolchain.

## Setting a breakpoint

As you know, the first step of debugging is to put in a breakpoint where you want the debugger to pause the execution. For example, if you are trying to understand how the App starts up, you would put a breakpoint in the first statement of the `main` method.

<box type="tip" seamless>

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

<box type="tip" seamless>

**Tip:** You can use a list of steps to guide the reader through the process of tracing the execution path. This can be done using Markbind's [**Lists**](https://markbind.org/userGuide/formattingContents.html#lists) feature.
</box>

1. Firstly, do this.

1. Next, do that.

1. Finally, do this.

## Conclusion

Here are some quick questions you can try to answer based on your execution path tracing. In some cases, you can do further tracing for the given commands to find exactly what happens.

1.  In this tutorial, we traced the "happy path" (i.e., no errors). What
    do you think will happen if we traced the following
    instead? What exceptions do you think will be thrown (if any), where
    will the exceptions be thrown and where will they be handled?

    1.  `Wrong input`

    2.  `Wrong input`

    3.  `Wrong input`


2.  What components will you have to modify to perform the following
    enhancements to the application?

    1.  Feature 1

    2.  Feature 2

    3.  Feature 3
