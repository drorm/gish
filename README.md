# gish

# gishTable of Contents
- [About](#about)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Modes](#modes)
    - [Command Line](#command-line)
    - [Piped](#piped)
    - [Interactive Mode](#interactive-mode)
  - [Command Line Usage](#command-line-usage)
  - [Interactive Mode](#interactive-mode-1)
  - [Priority](#priority)
  - [#Import](#import)
  - [Output/Log File](#outputlog-file)
  - [#Diff: Changing and Diffing a File](#diff-changing-and-diffing-a-file)
  - [Stats](#stats)

Gish is a a cli program to interact with openai GPT. It follows unix conventions and provides a rich set of features via flags.

**You need a paid openai account and a key to use it**, but it is totally a good investment if you can afford it.

## Features

- Command line, piped, or interactive (line python, node or psql).
- Keep a history of your questions and prompts in a local file for easy reference and modification
- Save responses for later review
- Easily incorporate files into your prompts using the `#import statement
- Flag to save code to a file
- Easily diff generated file with the original
- Stream the result, default, or get the result all at once
- See the number of tokens used in each request
- dryrun mode shows you what would be sent and how many estimated tokens. Useful to estimate the max size of output.
- automatically generate git commit messages and letting you edit them prior to submitting.

## Installation

1. Clone this repository

## Usage

2. Set OPENAI_API_KEY in your environment as per [OpenAI's recommendations](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety).
3. Run dist/index.js
4. Optionally, create a symbolic link to dist/index.js somewhere in your path. Alternatively, create an alias.
5. Set up your API key using one of these methods:

## modes

### command line

```
gish tell me a joke
gish "What is the population of the city of London?".
```

Note the quotes in the second request. Without the quotes, the shell will try to interpret the question mark, and you'll get an error.

### Piped

piped input:

```
echo "What is the population of the city of London?" | gish
```

### interactive mode:

```
gish.
```

Similar to typing "python" or "node" at the command line.

Support CTRL-P, CTRL-N and other [GNU readline] (https://en.wikipedia.org/wiki/GNU_Readline) shortcuts.

```
gist < foo
```

where foo's content is

```
tell me a joke
```

### Command line usage

- gish --help -- shows all the different options
- gish tell me a joke -- will just send the request
- gish "what is the population of San Francisco?". You need the quotes so that the shell doesn't complain about the '?'.
- gishe -e -- puts you in your editor and sends the content when you're done. To abort, either don't create the file, or empty it.
- gish -e foo.txt -- same as the previous option except that use an existing file.
- gish -i foo -- sends the content of foo. Equivalent to cat foo | gish.
- gish -m gpt-4 -- specify the model
- gish -p foo -- use foo as a prompt in a chat. You can use other flags or arguments to pass the actual request, but this is uses as the background. See https://platform.openai.com/docs/guides/chat. Gish sets this prompt as the first in the chat with the role of "assistant".
- gish -s foo.ts -- will save the output to foo.ts. When generating code, you need to use a prompt that will generate the appropriate output. See prompts/coding for an example.

### Interactive mode

- Interactive mode lets you type requests directly and pushing Enter sends the requests.
- You don't need to worry about escaping special characters.

## priority

Similar to linux commands like cat and echo, the following is how Gish prioritized the arguments and flags:

1. Command line args: gish "What is the population of the city of London?". Note the quotes. Without the quotes, the shell will try to interpret the question mark, and you'll get an error.
2. Piped input: echo "What is the population of the city of London?" | gish
3. Interactive mode: gish. Similar to typing "python" or "node" at the command line.

### #Import

Use the `#import` statement in your input file to include prompts or comments/text that you want ChatGPT to react to.

**Example**

```
#import hello.ts
The above program prints hello world. Change it to print goodbye world.

```

This is a typical example of the workflow when using ChatGPT for coding.

1. Use a standard prompt to define code handling
2. Tell the bot what you want it to do
3. Tell it which file it needs to work on.

### Output/Log File

The output file, ~/.gish.json behaves as the log of your conversations with ChatGPT. Since it's a standard file, you can use an editor or a pager to look at the history of your interactions with ChatGPT
It includes:

- A timestamp of a request
- The actual request
- The response

## #diff: Changing and diffing a file.

When you want the bot to make a changes to a file and then diff it, use the **#diff** option:

```

In the following file, document the code better

#diff settings.ts

```

This results in the same behavior as in **#import** but also lets the app know that you're changing the file.
Once the code is generated, the diff command defined in settings.ts is launched on the original and generated files.

## Stats

By default gish shows you stats for your request:

```
gish tell me a joke --no-stream
Why don't scientists trust atoms?
Because they make up everything.
Tokens: 26 Cost: $0.00005 Elapsed: 1.198 Seconds
```

> The cost is based on the assumption that you're using GPT3.5 at $0.02 per 1000 tokens.

**\*Double check the numbers before relying on them.**

> When using streaming, the API doesn't give us the number of tokens so we need to calculate these on our own, which could be off.
