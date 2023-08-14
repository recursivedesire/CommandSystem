# Command System

A showcase of modular command management, parsing, and execution. Every piece of this repo is designed to demonstrate the Command System's full integration with the Chaturbate API, exposing every functionality to users.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Advanced Usage](#advanced-usage)
  - [Error Handling](#error-handling)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features
- Dynamic command registration.
- Permission-based command execution.
- Command parsing with arguments and options.
- Extendable with new commands or command systems.
- Built-in error handling and validation.

## Installation
To use it directly in the Chaturbate App v2 IDE, just copy the content of a minified javascript release.
If you want to compile it on your own run:

```bash
git clone <repo-url>
npm install
npm run build
```

## Usage

### Basic Usage

#### 1. **Creating a Command**
Here's how you can define a simple command:

```typescript
import { Command } from 'path-to-command-system';

const greetCommand = new Command(
    "greet",
    "Greets a user",
    [],
    (args) => ({ success: true, message: `Hello, ${args.name}!` }),
    [new Parameter('name', 'User')]  // Name with default 'User'
);
```

#### 2. **Registering a Command**
Commands need to be registered to a command system:

```typescript
import { CommandSystem } from 'path-to-command-system';

const CS = new CommandSystem("MySystem");
CS.register(greetCommand);
```

#### 3. **Using the Help Command**
The system automatically includes a 'help' command:

```typescript
console.log(CS.execute("MySystem help").message); // Lists available commands
console.log(CS.execute("MySystem help greet").message); // Details about 'greet' command
```

### Advanced Usage

#### 1. **Command with Options**
Commands can have options, which are preceded by a `-`:

```typescript
const greetWithMoodCommand = new Command(
    "greetWithMood",
    "Greets a user with a mood",
    [],
    (args, opts) => {
        let mood = opts.mood || "happy";
        return { success: true, message: `Hello, ${args.name}! You seem ${mood} today.` };
    },
    [new Parameter('name', 'User')],
    [new Parameter('mood')]
);
```

Usage:

```typescript
console.log(CS.execute("MySystem greetWithMood John -mood excited").message);
// Expected output: "Hello, John! You seem excited today."
```

#### 2. **Nested Command Systems**
Command Systems can be nested:

```typescript
const innerSystem = new CommandSystem("inner");
innerSystem.register(greetCommand);

const outerSystem = new CommandSystem("outer");
outerSystem.register(innerSystem);

console.log(outerSystem.execute("outer inner greet John").message);
// Expected output: "Hello, John!"
```

### Executing Commands
Executing commands involves parsing a command string followed by its execution.

#### 1. **Parsing and Executing Command Strings**
To execute a command from a raw string, you first need to parse the string. After parsing, the command can be executed.

```typescript
const CS = new CommandSystem("MySystem");
const greetCommand = new Command(
    "greet",
    "Greets a user",
    [],
    (args) => ({ success: true, message: `Hello, ${args.name}!` }),
    [new Parameter('name', 'User')]  // Name with default 'User'
);
CS.register(greetCommand);

const commandString = "MySystem greet John";

// Parse the command
const parsedCommand = CS.parse(commandString);

// Check if the command is valid and execute
if (parsedCommand.valid) {
    const result = CS.execute(parsedCommand);
    console.log(result.message);  // Expected output: "Hello, John!"
} else {
    console.error(parsedCommand.error);
}
```

#### 2. **Short-cut: Directly Executing from a String**
For a quicker approach:

```typescript
const quickResult = CS.execute("MySystem greet Jane");
console.log(quickResult.message);  // Expected output: "Hello, Jane!"
```

Note: Using this method, if there's an error in the command, the `execute` function will handle it and return an error message in the result.

### Error Handling

Dealing with errors is essential to provide a user-friendly experience. The Command System has built-in error handling mechanisms to ensure that users are always informed about what went wrong and developers can effectively debug issues.

#### 1. **Parsing Errors**

When parsing a command string, it's possible that the provided string is malformed or doesn't match any registered command. In such cases, the `parse` function returns an object with a `valid` flag set to `false` and an `error` message detailing the problem.

```typescript
const parsedCommand = CS.parse("MySystem greetWithoutRegistering");
if (!parsedCommand.valid) {
    console.error(`Parsing Error: ${parsedCommand.error}`);
}
```

#### 2. **Execution Errors**

Even if a command string is correctly parsed, there might be issues during execution. These could arise due to issues in the command's logic or other runtime problems. Execution errors are included in the result returned by the `execute` function.

```typescript
const result = CS.execute("MySystem greet");
if (!result.success) {
    console.error(`Execution Error: ${result.message}`);
}
```

#### 3. **Parameter and Option Errors**

Commands can expect certain parameters or options. If these are missing or invalid, errors are generated. These are handled similarly to parsing errors and are included in the result object.

```typescript
const result = CS.execute("MySystem greetWithMood John");
if (!result.success) {
    console.error(`Parameter Error: ${result.message}`);
}
```

## Testing
To ensure the reliability of the Command System, we have a comprehensive test suite. 

```bash
npm run test
```

## Contributing
All forms of contributions are welcome! If you have improvements, ideas, or would like to collaborate, please open an issue or submit a pull request. Any feedback or assistance is highly valued.
