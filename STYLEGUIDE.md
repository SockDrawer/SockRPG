SockRPG Code Style Guide
===

Introduction
---
While throwaway apps and quickie scripts won’t suffer much from poor code formatting, the same cannot be said for larger codebases; the larger the codebase, the more rigorously enforced a consistent coding style needs to be. This helps not just the existing developers maintaining the code, but also new developers who will be able to get up to speed with the codebase much quicker if the code has good clarity. Having said that, there are occasions where enforcing a strict coding style can make code less readable. Therefore, what follows are guidelines and commandments; while guidelines may be broken within reason, commandments must never be.

All rules and commandments will be enforced with ESLint rules where possible.

###Commandments
1. One shall be the number of tabs in thine indent, and the number of tabs in thine indent shall be one. Two shalt not count, nor shalt zero, except on thy way to one. And three is right out.
1. Spaces are an abomination unto thy indent; only tabs are permitted.
1. Operators of a logical and mathematical nature shall be flanked by a single space each side; this also applies to the arrow in thy arrow functions.
1. A keyword must be followed by a space; however, thy function names must not.
1. There shall be a single space between thy closing parenthesis and opening brace for both functions and control flow structures.
1. Leavers of trailing whitespace shall be smote with great prejudice.
1. Thy newlines shall be `\n` alone.
1. Omitters of thy statement-ending semicolons shall be smote with righteous fury.
1. Keep thy lines at 120 characters or less.
1. Thy strings are to be fenced in single quotes only.
1. The keyword var shall be struck from thy vocabulary; only const and let are permitted.
1. Each of thy code files must start with ‘use strict’, and end with a single `\n`.
1. Thy opening braces shall always accompany the same line as their owning statement.
1. Thou must use camelCase for thy function names, variables, constants, and properties.
1. Thou must use PascalCase for thy class names.
1. Thou shalt not begin thy names with impersonal pronouns, lest they be smited.
1. Thy constants must not be in all-capitals.
1. Thou art forbidden to use == and !=.
1. Thou art forbidden to extend a built-in prototype.
1. When thou comments, thou shalt comment in nought but English.
1. Thou must comment functions and objects declared at module level with the glory of JSDoc.
1. Thou shalt leave no more than one blank line between code blocks.

###Guidelines
####How to choose a name
Naming things is hard. But stick to a few easy rules, and it becomes a lot easier. And if the names are good enough, you won’t need comments; the code will document itself.

####Functions
The best function names are short, descriptive, and start with a single verb, which is often followed by a noun. Try to avoid pronouns, and especially avoid the word ‘the’. If required, multiple nouns are permitted with appropriate conjunctions.

If in doubt, remember: a function does.

Examples of good names:
* run() - verb
* startTask()
* addUserOrAdmin()

Examples of bad names:
* updateTheUser() - updateUser() is equally descriptive and more concise
* taskCreate() - createTask() is more intuitive
* dictionary() - both toDictionary() and asDictionary() are clearer

There are three exceptions to starting a function name with a verb; the first is starting with an ordinal:
* firstOrDefault()
* thirdCall()
* lastItem()

The second is starting with ‘on’, but only for event handlers:
* onClick()

The third is the use of an adverb:
* then()

#### Constants and variables
Unlike functions, where verbs are preferred, constants and variables should be a single noun, either singular or plural, optionally preceded by an adjective. If in doubt, remember: a constant or variable is.

Examples of good names:
* users
* count
* totalCost

Examples of bad names:
* run - Is this the run number? The name? Or the run itself?
* smooth - Is this a noun or a verb?

#### Booleans
Constants and variables of Boolean type should differ from other types by being named after the condition they represent. For example:
* isRunning
* hasChildren

#### Loop invariants
This special class of variable is most often seen declared as part of a for loop; given the narrow scope of such variables, and their frequent use as array indexes, these may be a single character where it does not affect code clarity.

The most common variable of this type is ‘i’; this should be the first choice, with the use of ‘j’, ‘k’, and onwards for nested loops.

#### Module constants
Generally speaking, constants that hold the results of a call to require() should follow the same rules as all other constants; however, there is an exception. When that module defines a class, the constant should have the same PascalCase name.

Never use a variable to store a reference to a module.

####Classes
Like constants and variables, class names should always be a noun or chain of adjectives and nouns; unlike constants and variables however, the name should always be singular.

Examples of good names:
* Post
* QueuedTask

Examples of bad names:
* Boards - use an array to store a collection
* Running - running what?

There is one instance where verbs work in class names, and that is when the class performs a task. For example:
* TaskRunner
* PostSanitizer
* UserSerializer

Note that the verb conjugations used are, in fact, nouns.

#### Modules
Modules that define a single class should have the same name as the class; otherwise, the rules that apply to class names also apply to module names, except the names should be camelCase instead of PascalCase.

#### Callbacks
With Node and JavaScript, asynchronicity is the name of the game; to that end, most potentially blocking calls require a callback parameter.

##### Defining a callback
The first argument passed to a callback must either be null or an instance of Error; callbacks can choose to ignore this parameter if they don’t need to handle errors, but they should still accept it.

Examples of good callback functions:
* `function processResponse(err, response) {}`
* `function logMessage(_, message) {} //The error is ignored`

##### Providing a callback
For a function that is passed a single callback, that callback should be the last argument in the argument list; when multiple callbacks are used, they should all be at the end of the argument list, with the continuation callback last of all. By convention, the continuation callback parameter is called ‘callback’; the other callbacks should be named according to their purpose.

Examples of good functions that accept callbacks:
* `function getResponse(address, data, callback) {}`

Here, the only callback is the continuation callback
* `function validateEach(users, each, callback) {}`

Here, there is the ‘each’ callback which is called for each user in users, and after that, the continuation callback

##### Continuation callbacks
Continuation callbacks should only be called once; to avoid issues, always return the call to the continuation callback. And remember to pass in either null or an instance of Error as the first argument!

#### Promises
ES6 and Node 4.0 bring first-class support for Promises to JavaScript.

##### Defining a Promise
Always use the Promise object provided by Node to create promises; this ensures that they always behave consistently.

##### Using Promises
Even though then() accepts an error callback as its second argument, do not use it to handle errors; Node defines a catch() function that should be used instead.

#### Blocks
Delineated by braces, blocks are a fundamental constituent of code; the code within a block should be indented one tab relative to the containing statement.
Example:
```
function login(username, password) {
    if (!username || !password) {
        throw new Error(‘Invalid credentials’);
    }
    // Do login things
}
```

#### Functions
##### How long?
Generally speaking, functions should fit entirely within a single screen without scrolling; if a function is long enough to require scrolling, consider breaking it into two or more parts.

##### How many arguments?
Most functions require zero to three arguments, but there are some that require more. If you need more than six, consider wrapping them inside a JSON-style object instead. And definitely do so if you need more than ten.

##### Varargs
In JavaScript, the definition of a varargs function doesn’t use special syntax. Instead, it uses the arguments array that is defined for every function; this means the function signature can be very short indeed.

When calling such a function, insert line breaks to keep lines within 120 characters; indent each new line one tab relative to the first line of the function call.

##### Arrow functions
New in ES6, arrow functions are extremely useful; however, as they cannot be named, their use should be restricted to short callbacks with few arguments.

##### Call chains
Promise-heavy code is likely to feature call chains; when chaining methods, each call should start on a new line, indented one tab in the same manner the body of a loop is.

##### To document or not to document?
Is the function defined at module level? Yes? Document it.

##### Blocking functions
If your function is likely to take a long time to execute, make it an asynchronous function, and either require a continuation callback or define and return a Promise.
