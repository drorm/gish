# gish

# Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Download an executable](download-an-executable)
  - [From source](#from-source)
- [Usage](#usage)
  - [Modes](#modes)
    - [Command Line](#command-line)
    - [Piped](#piped)
    - [Interactive Mode](#interactive-mode)
  - [Command Line Usage](#command-line-usage)
  - [Interactive Mode](#interactive-mode-1)
  - [Priority](#priority)
  - [#Import](#import)
  - [#Diff: Changing and Diffing a File](#diff-changing-and-diffing-a-file)
  - [Log File](#log-file)
  - [Stats](#stats)

Gish is a CLI to interact with OpenAI GPT. It follows Unix conventions and provides a rich set of features via flags. Please note that you need a paid OpenAI account and a key to use it, but it is a good investment if you can afford it.

## Features

- Command line, piped, or interactive (like python, node or psql)
- Easily incorporate files into your prompts using the #import` statement
- Easily diff generated file with the original using the #diff statement or the -d flag
- Keep a history of your questions and prompts in a local file for easy reference and modification
- Save responses for later review
- Flag to save code to a file
- Stream the result (default), or get the result all at once
- See the number of tokens used in each request
- Dry-run mode shows you what would be sent and how many estimated tokens. Useful to estimate the max size of output
- Automatically generate Git commit messages and letting you edit them prior to submitting

## Screencast

[![Screencast](https://asciinema.org/a/570434.png)](https://asciinema.org/a/570434)

## Installation

### Download an executable

1. Go to the [**Releases**](https://github.com/drorm/gish/releases) page of this repository.
2. Download the executable for your platform from the assets section.

### From source

1. Clone this repository
2. npm install
3. npm build
4. run dist/index.js

Alternativey, replace step 3 with npm dev to make changes to the code an

## Usage

1. Set OPENAI_API_KEY in your environment as per [OpenAI's recommendations](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety).
2. Run `dist/index.js`
3. Optionally, create a symbolic link to `dist/index.js` somewhere in your path. Alternatively, create an alias.
4. Set up your API key using one of these methods:

### Modes

#### Command Line

```
gish tell me a joke
gish "What is the population of the city of London?".
```

Note the quotes in the second request. Without the quotes, the shell will try to interpret the question mark, and you'll get an error.

#### Piped

Piped input:

```
echo "What is the population of the city of London?" | gish
```

#### Interactive Mode

```
gish.
```

Similar to typing "python" or "node" at the command line.

```
gist < foo
```

where foo's content is

```
tell me a joke
```

### Command Line Usage

- `gish --help` shows all the different options
- `gish tell me a joke` will just send the request
- `gish "what is the population of San Francisco?".` You need the quotes so that the shell doesn't complain about the '?'
- `gish -e` puts you in your editor and sends the content when you're done. To abort, either don't create the file or empty it
- `gish -e foo.txt` same as the previous option except using an existing file
- `gish -i foo` sends the content of foo. Equivalent to `cat foo | gish`
- `gish -m gpt-4` specify the model
- `gish -p foo` use foo as a prompt in a chat. You can use other flags or arguments to pass the actual request but this is used as the background. See https://platform.openai.com/docs/guides/chat. Gish sets this prompt as the first in the chat with the role of "assistant"
- `gish -s foo.ts` will save the output to foo.ts. When generating code, you need to use a prompt that will generate the appropriate output. See prompts/coding for an example

### Interactive Mode

- Interactive mode lets you type requests directly one after the other.
- You don't need to worry about escaping special characters
- Support CTRL-P, CTRL-N and other [GNU readline] (https://en.wikipedia.org/wiki/GNU_Readline) shortcuts.

## priority

Similar to linux commands like cat and echo, the following is how Gish prioritized the arguments and flags:

1. Command line args: gish "What is the population of the city of London?". Note the quotes. Without the quotes, the shell will try to interpret the question mark, and you'll get an error.
2. Piped input: echo "What is the population of the city of London?" | gish
3. Interactive mode: gish. Similar to typing "python" or "node" at the command line.

### #Import

Use the `#import` statement in your input file to include prompts or comments/text that you want ChatGPT to react to.
**Example**

```
#import ~/work/gish/tasks/coding.txt
The above program prints hello world. Change it to print goodbye world.
#import hello.ts
```

And here's the text of tasks/coding.txt
```
I want you to act as a coding  collaborator. I will ask you software questions and you will answer with code. 
Your response for this request needs to be code and nothing else. 
Only provide comments if they provide important extra information and they should be brief and to the point.  The contents should be in the code as comments at the top of the file.
------------------------------------------------------------------------------
```
This is a typical example of the workflow when using gish for coding:

1. Use a standard prompt to define the code handling
2. Tell the bot what you want it to do
3. Tell it which file it needs to work on.


### #Diff: Changing and Diffing a File

When you want GPT to make changes to a file and then diff it, use the `#diff` option:

```
#import ~/work/gish/tasks/coding.txt
In the following file, document the code better
#diff settings.ts
```

This results in the same behavior as in `#import`, but also lets the app know that you're changing the file. Once the code is generated, the diff command defined in `settings.ts` is launched on the original and generated files.
**For complex changes, I find it better the Copilot.**
### Log File

The log file, ~/.gish.json behaves as the log of your conversations with ChatGPT. Since it's a standard file, you can use an editor or a pager to look at the history of your interactions with ChatGPT
It includes:

- A timestamp of a request
- The actual request
- The response

### Stats

By default, gish shows you stats for your request:

```
gish tell me a joke --no-stream
Why don't scientists trust atoms?
Because they make up everything.
Tokens: 26 Cost: $0.00005 Elapsed: 1.198 Seconds
```

> The cost is based on the assumption that you're using GPT3.5 at $0.02 per 1000 tokens.
> **\*Double check the numbers before relying on them.**
> When using streaming, the API doesn't give us the number of tokens, so we need to calculate these on our own, which could be off.
