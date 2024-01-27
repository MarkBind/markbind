---
  layout: default.md
  title: "Tutorial: Tracing code"
  pageNav: 3
---

# Tutorial: Tracing code


> Indeed, the ratio of time spent reading versus writing is well over 10 to 1. We are constantly reading old code as part of the effort to write new code. …​\[Therefore,\] making it easy to read makes it easier to write.
>
> —  Robert C. Martin Clean Code: A Handbook of Agile Software Craftsmanship

When trying to understand an unfamiliar code base, one common strategy used is to trace some representative execution path through the code base. One easy way to trace an execution path is to use a debugger to step through the code. In this tutorial, you will be using the IntelliJ IDEA’s debugger to trace the execution path of a specific user command.

<!-- * Table of Contents -->
<!-- {:toc} -->

## Before we start

Before we jump into the code, it is useful to get an idea of the overall structure and the high-level behavior of the application. This is provided in the 'Architecture' section of the developer guide. In particular, the architecture diagram (reproduced below), tells us that the App consists of several components.

<puml src="../diagrams/ArchitectureDiagram.puml" alt="ArchitectureDiagram" />

It also has a sequence diagram (reproduced below) that tells us how a command propagates through the App.

<puml src="../diagrams/ArchitectureSequenceDiagram.puml" width="550" />

Note how the diagram shows only the execution flows _between_ the main components. That is, it does not show details of the execution path *inside* each component. By hiding those details, the diagram aims to inform the reader about the overall execution path of a command without overwhelming the reader with too much details. In this tutorial, you aim to find those omitted details so that you get a more in-depth understanding of how the code works.

Before we proceed, ensure that you have done the following:
1. Read the [*Architecture* section of the DG](../DeveloperGuide.md#architecture)
1. Set up the project in Intellij IDEA
1. Learn basic debugging features of Intellij IDEA
   * If you are using a different IDE, we'll leave it to you to figure out the equivalent feature to use in your IDE.
   * If you are not using an IDE, we'll let you figure out how to achieve the same using your coding toolchain.

## Setting a breakpoint

As you know, the first step of debugging is to put in a breakpoint where you want the debugger to pause the execution. For example, if you are trying to understand how the App starts up, you would put a breakpoint in the first statement of the `main` method.

In our case, we would want to begin the tracing at the very point where the App start processing user input (i.e., somewhere in the UI component), and then trace through how the execution proceeds through the UI component. However, the execution path through a GUI is often somewhat obscure due to various *event-driven mechanisms* used by GUI frameworks, which happens to be the case here too. Therefore, let us put the breakpoint where the `UI` transfers control to the `Logic` component.

<puml src="../diagrams/ArchitectureSequenceDiagram.puml" width="550" />

According to the sequence diagram you saw earlier (and repeated above for reference), the `UI` component yields control to the `Logic` component through a method named `execute`. Searching through the code base for an `execute()` method that belongs to the `Logic` component yields a promising candidate in `seedu.address.logic.Logic`.

<img src="../images/tracing/searchResultsForExecuteMethod.png" />

<box type="tip" seamless>

**Intellij Tip:** The ['**Search Everywhere**' feature](https://www.jetbrains.com/help/idea/searching-everywhere.html) can be used here. In particular, the '**Find Symbol**' ('Symbol' here refers to methods, variables, classes etc.) variant of that feature is quite useful here as we are looking for a _method_ named `execute`, not simply the text `execute`.
</box>

A quick look at the `seedu.address.logic.Logic` (an extract given below) confirms that this indeed might be what we’re looking for.

```java
public interface Logic {
    /**
     * Executes the command and returns the result.
     * @param commandText The command as entered by the user.
     * @return the result of the command execution.
     * @throws CommandException If an error occurs during command execution.
     * @throws ParseException If an error occurs during parsing.
     */
    CommandResult execute(String commandText) throws CommandException, ParseException;
...
}
```

But apparently, this is an interface, not a concrete implementation.
That should be fine because the [Architecture section of the Developer Guide](../DeveloperGuide.html#architecture) tells us that components interact through interfaces. Here's the relevant diagram:

<puml src="../diagrams/ComponentManagers.puml" />

Next, let's find out which statement(s) in the `UI` code is calling this method, thus transferring control from the `UI` to the `Logic`.

<box type="tip" seamless>

**Intellij Tip:** The ['**Find Usages**' feature](https://www.jetbrains.com/help/idea/find-highlight-usages.html#find-usages) can find from which parts of the code a class/method/variable is being used.
</box>

![`Find Usages` tool window. `Edit` \> `Find` \> `Find Usages`.](../images/tracing/FindUsages.png)

Bingo\! `MainWindow#executeCommand()` seems to be exactly what we’re looking for\!

Now let’s set the breakpoint. First, double-click the item to reach the corresponding code. Once there, click on the left gutter to set a breakpoint, as shown below.
 ![LeftGutter](../images/tracing/LeftGutter.png)

## Tracing the execution path

Recall from the User Guide that the `edit` command has the format: `edit INDEX [n/NAME] [p/PHONE] [e/EMAIL] [a/ADDRESS] [t/TAG]…​` For this tutorial we will be issuing the command `edit 1 n/Alice Yeoh`.

<box type="tip" seamless>

**Tip:** Over the course of the debugging session, you will encounter every major component in the application. Try to keep track of what happens inside the component and where the execution transfers to another component.
</box>

1. To start the debugging session, simply `Run` \> `Debug Main`

1. When the GUI appears, enter `edit 1 n/Alice Yeoh` into the command box and press `Enter`.

1. The Debugger tool window should show up and show something like this:<br>
   ![DebuggerStep1](../images/tracing/DebuggerStep1.png)

1. Use the _Show execution point_ feature to jump to the line of code that we stopped at:<br>
   ![ShowExecutionPoint](../images/tracing/ShowExecutionPoint.png)<br>
   `CommandResult commandResult = logic.execute(commandText);` is the line that you end up at (i.e., the place where we put the breakpoint).

1. We are interested in the `logic.execute(commandText)` portion of that line so let’s _Step in_ into that method call:<br>
    ![StepInto](../images/tracing/StepInto.png)

1. We end up in `LogicManager#execute()` (not `Logic#execute` -- but this is expected because we know the `execute()` method in the `Logic` interface is actually implemented by the `LogicManager` class). Let’s take a look at the body of the method. Given below is the same code, with additional explanatory comments.

   **LogicManager\#execute().**

   ```java
   @Override
   public CommandResult execute(String commandText)
           throws CommandException, ParseException {

        //Logging, safe to ignore
        logger.info("----------------[USER COMMAND][" + commandText + "]");

        CommandResult commandResult;
        //Parse user input from String to a Command
        Command command = addressBookParser.parseCommand(commandText);
        //Executes the Command and stores the result
        commandResult = command.execute(model);

        try {
            //We can deduce that the previous line of code modifies model in some way
            // since it's being stored here.
            storage.saveAddressBook(model.getAddressBook());
        } catch (IOException ioe) {
            throw new CommandException(FILE_OPS_ERROR_MESSAGE + ioe, ioe);
        }

        return commandResult;
    }
   ```

1. `LogicManager#execute()` appears to delegate most of the heavy lifting to other components. Let’s take a closer look at each one.

1. _Step over_ the logging code since it is of no interest to us now.
   ![StepOver](../images/tracing/StepOver.png)

1. _Step into_ the line where user input in parsed from a String to a Command, which should bring you to the `AddressBookParser#parseCommand()` method (partial code given below):
   ```java
   public Command parseCommand(String userInput) throws ParseException {
       ...
       final String commandWord = matcher.group("commandWord");
       final String arguments = matcher.group("arguments");
       ...
   ```

1. _Step over_ the statements in that method until you reach the `switch` statement. The 'Variables' window now shows the value of both `commandWord` and `arguments`:<br>
    ![Variables](../images/tracing/Variables.png)

1. We see that the value of `commandWord` is now `edit` but `arguments` is still not processed in any meaningful way.

1. Stepping through the `switch` block, we end up at a call to `EditCommandParser().parse()` as expected (because the command we typed is an edit command).

    ```java
    ...
    case EditCommand.COMMAND_WORD:
        return new EditCommandParser().parse(arguments);
    ...
    ```

1. Let’s see what `EditCommandParser#parse()` does by stepping into it. You might have to click the 'step into' button multiple times here because there are two method calls in that statement: `EditCommandParser()` and `parse()`.

   <box type="tip" seamless>

   **Intellij Tip:** Sometimes, you might end up stepping into functions that are not of interest. Simply use the `step out` button to get out of them!
   </box>

1. Stepping through the method shows that it calls `ArgumentTokenizer#tokenize()` and `ParserUtil#parseIndex()` to obtain the arguments and index required.

1. The rest of the method seems to exhaustively check for the existence of each possible parameter of the `edit` command and store any possible changes in an `EditPersonDescriptor`. Recall that we can verify the contents of `editPersonDesciptor` through the 'Variables' window.<br>
   ![EditCommand](../images/tracing/EditCommand.png)

1. As you just traced through some code involved in parsing a command, you can take a look at this class diagram to see where the various parsing-related classes you encountered fit into the design of the `Logic` component.
   <puml src="../diagrams/ParserClasses.puml" width="600"/>

1. Let’s continue stepping through until we return to `LogicManager#execute()`.

    The sequence diagram below shows the details of the execution path through the Logic component. Does the execution path you traced in the code so far match the diagram?<br>
    <puml src="../diagrams/tracing/LogicSequenceDiagram.puml" alt="Tracing an `edit` command through the Logic component"/>

1. Now, step over until you read the statement that calls the `execute()` method of the `EditCommand` object received, and step into that `execute()` method (partial code given below):

   **`EditCommand#execute()`:**
   ```java
   @Override
   public CommandResult execute(Model model) throws CommandException {
       ...
       Person personToEdit = lastShownList.get(index.getZeroBased());
       Person editedPerson = createEditedPerson(personToEdit, editPersonDescriptor);
       if (!personToEdit.isSamePerson(editedPerson) && model.hasPerson(editedPerson)) {
           throw new CommandException(MESSAGE_DUPLICATE_PERSON);
       }
       model.setPerson(personToEdit, editedPerson);
       model.updateFilteredPersonList(PREDICATE_SHOW_ALL_PERSONS);
       return new CommandResult(String.format(MESSAGE_EDIT_PERSON_SUCCESS, editedPerson));
   }
   ```

1. As suspected, `command#execute()` does indeed make changes to the `model` object. Specifically,
   * it uses the `setPerson()` method (defined in the interface `Model` and implemented in `ModelManager` as per the usual pattern) to update the person data.
   * it uses the `updateFilteredPersonList` method to ask the `Model` to populate the 'filtered list' with _all_ persons.<br>
     FYI, The 'filtered list' is the list of persons resulting from the most recent operation that will be shown to the user immediately after. For the `edit` command, we populate it with all the persons so that the user can see the edited person along with all other persons. If this was a `find` command, we would be setting that list to contain the search results instead.<br>
     To provide some context, given below is the class diagram of the `Model` component. See if you can figure out where the 'filtered list' of persons is being tracked.
     <puml src="../diagrams/ModelClassDiagram.puml" width="450" /><br>
   * :bulb: This may be a good time to read through the [`Model` component section of the DG](../DeveloperGuide.html#model-component)

1. As you step through the rest of the statements in the `EditCommand#execute()` method, you'll see that it creates a `CommandResult` object (containing information about the result of the execution) and returns it.<br>
   Advancing the debugger by one more step should take you back to the middle of the `LogicManager#execute()` method.<br>

1. Given that you have already seen quite a few classes in the `Logic` component in action, see if you can identify in this partial class diagram some of the classes you've encountered so far, and see how they fit into the class structure of the `Logic` component:
    <puml src="../diagrams/LogicClassDiagram.puml" width="550"/>

   * :bulb: This may be a good time to read through the [`Logic` component section of the DG](../DeveloperGuide.html#logic-component)

1. Similar to before, you can step over/into statements in the `LogicManager#execute()` method to examine how the control is transferred to the `Storage` component and what happens inside that component.

   <box type="tip" seamless>

   **Intellij Tip:** When trying to step into a statement such as `storage.saveAddressBook(model.getAddressBook())` which contains multiple method calls, Intellij will let you choose (by clicking) which one you want to step into.
   </box>

1. As you step through the code inside the `Storage` component, you will eventually arrive at the `JsonAddressBook#saveAddressBook()` method which calls the `JsonSerializableAddressBook` constructor, to create an object that can be _serialized_ (i.e., stored in storage medium) in JSON format. That constructor is given below (with added line breaks for easier readability):

    **`JsonSerializableAddressBook` constructor:**
    ```java
    /**
     * Converts a given {@code ReadOnlyAddressBook} into this class for Jackson use.
     *
     * @param source future changes to this will not affect the created
     * {@code JsonSerializableAddressBook}.
     */
    public JsonSerializableAddressBook(ReadOnlyAddressBook source) {
        persons.addAll(
            source.getPersonList()
                  .stream()
                  .map(JsonAdaptedPerson::new)
                  .collect(Collectors.toList()));
    }
    ```

1. It appears that a `JsonAdaptedPerson` is created for each `Person` and then added to the `JsonSerializableAddressBook`.
   This is because regular Java objects need to go through an _adaptation_ for them to be suitable to be saved in JSON format.

1. While you are stepping through the classes in the `Storage` component, here is the component's class diagram to help you understand how those classes fit into the structure of the component.<br>
   <puml src="../diagrams/StorageClassDiagram.puml" width="550" />

   * :bulb: This may be a good time to read through the [`Storage` component section of the DG](../DeveloperGuide.html#storage-component)

1. We can continue to step through until you reach the end of the `LogicManager#execute()` method and return to the `MainWindow#executeCommand()` method (the place where we put the original breakpoint).

1. Stepping into `resultDisplay.setFeedbackToUser(commandResult.getFeedbackToUser());`, we end up in:

    **`ResultDisplay#setFeedbackToUser()`**
    ```java
    public void setFeedbackToUser(String feedbackToUser) {
        requireNonNull(feedbackToUser);
        resultDisplay.setText(feedbackToUser);
    }
    ```

1. Finally, you can step through until you reach the end of`MainWindow#executeCommand()`.<br>
   :bulb: This may be a good time to read through the [`UI` component section of the DG](../DeveloperGuide.html#ui-component)


## Conclusion

In this tutorial, we traced a valid edit command from raw user input to the result being displayed to the user. From this tutorial, you learned more about how the various components work together to produce a response to a user command.

Here are some quick questions you can try to answer based on your execution path tracing. In some cases, you can do further tracing for the given commands to find exactly what happens.

1.  In this tutorial, we traced the "happy path" (i.e., no errors). What
    do you think will happen if we traced the following commands
    instead? What exceptions do you think will be thrown (if any), where
    will the exceptions be thrown and where will they be handled?

    1.  `redit 1 n/Alice Yu`

    2.  `edit 0 n/Alice Yu`

    3.  `edit 1 n/Alex Yeoh`

    4.  `edit 1`

    5.  `edit 1 n/アリス ユー`

    6.  `edit 1 t/one t/two t/three t/one`

2.  What components will you have to modify to perform the following
    enhancements to the application?

    1.  Make command words case-insensitive

    2.  Allow `delete` to remove more than one index at a time

    3.  Save the address book in the CSV format instead

    4.  Add a new command

    5.  Add a new field to `Person`

    6.  Add a new entity to the address book
