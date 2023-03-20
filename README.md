# gish

> **Warning**
> This is very much work in progress.

gish is a shell to interact with openai GPT. **You need a paid account and a key to use it**.

## Features

- Command line, interactive, or piped
- Keep a history of your questions and prompts in a local file for easy reference and modification
- Save responses for later review
- Easily incorporate files into your prompts using the `#import` statement
- Save code or other information provided in code blocks with the `save_files.py` script
- Modify existing code easily with the `save_files.py` script
- Stream (default), or get the result all at once
- See the cost of each request
- dryrun mode shows you what would be sent and how many estimated tokens. Useful to estimate the max size of output.
- Incorporate tasks:
  - Generate git commit messages

## Installation

1. Clone this repository
2. make sure you have a .openai file in your home directory

## Usage

2. run dist/index.js
3. Optionally, create a symbolic link to dist/index.js somewhere in your path. Alternatively, create an alias.

## modes

### command line

```
gish tell me a joke
gish "What is the population of the city of London?".
```

Note the quotes. Without the quotes, the shell will try to interpret the question mark, and you'll get an error.

### Piped

piped input: echo "What is the population of the city of London?" | gish

### interactive mode:

```
gish.
```

Similar to typing "python" or "node" at the command line.
Alternatively you could do something like

```
gist < foo
```

where foo's content is

```

### Command line usage

- gish tell me a joke
- gish "what is the population of San Francisco?". You need the quotes so that the shell doesn't complain about the '?'.
- gish -i foo sends the content of foo. Equivalent to cat foo | gish.
- gishe -e -- puts you in your editor and sends the content when you're done. To abort, either don't create the file, or empty it.
- gish -e -- foo.txt same as the previous option except that use an existing file.

### Interactive mode

Typically you'll go through the following cycle

1.  Enter your prompt in the input file
2.  Use the `send` command in the CLI: `send path/to/input/file path/to/output/file`
3.  Review the output in the output file
4.  Repeat as needed, using `^P` to bring up the previous command and `enter` to send it

### priority

priority, similar to linux commands like cat and echo:

1. command line args: gish "What is the population of the city of London?". Note the quotes. Without the quotes, the shell will try to interpret the question mark, and you'll get an error.
2. piped input: echo "What is the population of the city of London?" | gish
3. interactive mode: gish. Similar to typing "python" or "node" at the command line.

### Using Files

#### Input File

All input to ChatGPT is sent through the input file, which allows for:

- Rich editing capabilities in your preferred editor, including undo/redo
- Version control of prompts using Git
- Inclusion of other files in your input using the `#include` statement

#### Import

Use the `#import` statement in your input file to include prompts or comments/text that you want ChatGPT to react to.

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
```
