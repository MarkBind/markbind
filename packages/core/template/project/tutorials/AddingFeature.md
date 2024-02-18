---
  layout: default.md
  title: "Tutorial: Adding feature"
  pageNav: 3
---

# Tutorial: Adding feature

<box type="tip">
This page can be taken as a reference on how to add new features to your project.
</box>

Let's walk you through the implementation of a new feature.

We’ll assume that you have already set up the development environment as outlined in the Developer’s Guide.


## Create a new feature

Description of the feature to be added and brief explanation of the changes to be made.

### Add a new `FeatureX` class

This section teaches you how to add a new class to the project. This includes creating the class, adding the necessary fields and methods, and updating the necessary classes to use the new class.

<box type="tip" seamless>

**Tip:** You can use a combination of Markbind's [**Images and Diagrams**](https://markbind.org/userGuide/components/imagesAndDiagrams.html) features such as `puml` and `pic` tags to provide a visual representation of the steps to be taken. [**Code blocks**](https://markbind.org/userGuide/formattingContents.html#code) can also be used as shown below.
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

## Modify `FeatureA` to support the new `FeatureX` feature

This section teaches you how to modify an existing class to support the new feature. This includes adding new fields and methods, and updating the necessary classes to use the new feature.

<box type="tip" seamless>

**Tip:** You can use a list of steps to guide the reader through the process of tracing the execution path. This can be done using Markbind's [**Lists**](https://markbind.org/userGuide/formattingContents.html#lists) feature.
</box>

1. Firstly, do this.

1. Next, do that.

1. Finally, do this.

## Writing tests

Tests are crucial to ensuring that bugs don’t slip into the codebase unnoticed. This is especially true for large code bases where a change might lead to unintended behavior.

Let’s verify the correctness of our code by writing some tests!

### Manually writing tests

The goal is to write effective and efficient tests to ensure that `FeatureX` behaves as expected.

The convention for test names is `methodName_testScenario_expectedResult`. An example would be
`execute_filteredList_success`.

Let’s create a test for `FeatureX` to test that it works. 

<box type="tip" seamless>

**Tip:** [**Code blocks**](https://markbind.org/userGuide/formattingContents.html#code) will be especially useful in visually showing what test code would look like, coded in your desired format.
</box>

## Conclusion

This concludes the tutorial for adding a new feature.
