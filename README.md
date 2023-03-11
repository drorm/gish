# gish

# ChatGPT Pilot

> **Warning**
> This is very much work in progress.

gish is a shell to interact with openai GPT. **You need a paid account and a key to use it**.

## Features

- Command line or interactive
- Keep a history of your questions and prompts in a local file for easy reference and modification
- Save responses for later review
- Easily incorporate files into your prompts using the `#include` statement
- Save code or other information provided in code blocks with the `save_files.py` script
- Modify existing code easily with the `save_files.py` script

## Installation

1.  Clone this repository
2.  TODO: Install dependencies using `pip install -r requirements.txt`

## Usage

1.  Run `main.py`
2.  Log in to your ChatGPT account
3.  Return to the terminal and hit `enter` to begin sending commands

### Basic Operation

Typically you'll go through the following cycle

1.  Enter your prompt in the input file
2.  Use the `send` command in the CLI: `send path/to/input/file path/to/output/file`
3.  Review the output in the output file
4.  Repeat as needed, using `^P` to bring up the previous command and `enter` to send it

### Using Files

#### Input File

All input to ChatGPT is sent through the input file, which allows for:

- Rich editing capabilities in your preferred editor, including undo/redo
- Version control of prompts using Git
- Inclusion of other files in your input using the `#include` statement

#### Includes

Use the `#include` statement in your input file to include prompts or comments/text that you want ChatGPT to react to.

**Example**

```
#import prompts/coding

The following program save_files.py saves files by appending ".1" to the file name. Change is so that it does the following:

#include prompts/coding

The `save_files.py` script can be used to save files with the following behavior:

1. Appends "-1" to the prefix of the file name. So foo.py becomes foo-1.py.
2. checks to see if the new file name exists. If it exists, increment the -1 to -2 and keep doing that till you don't find a name that exists.
3. Save with the new name

#import save_files.py

```

This is a typical example of the workflow when using ChatGPT for coding.

1. Use a standard prompt to define code handling
2. Tell the bot what you want it to do
3. Tell it which file it needs to work on.

### Output/Log File

The output files behaves as the log of your conversations with ChatGPT. Since it's a standard file, you can use an editor or a pager to look at the history of your interactions with ChatGPT
It includes:

- A timestamp of a request
- The actual request
- The response

## Changing/diffing a file.

When you want the bot to make a changes to a file use the **#change** option:

```
In the following file, document the code better

#change settings.ts
```

This results in the same behavior as in **#import** but also lets the app know that you're changing the file.
You also need to add the option **diff** to your command.

```
submit input output diff
```

And the app will wait for the bot to send a new version of the file and will diff it with the original.
