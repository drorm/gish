# gish

> **Warning**
> This is very much work in progress.

gish is a shell to interact with openai GPT. **You need a paid account and a key to use it**.

## Features

- Command line, interactive, or piped
- Keep a history of your questions and prompts in a local file for easy reference and modification
- Save responses for later review
- Easily incorporate files into your prompts using the `#import` statement
- Flag to save code to file
- Easily compare generated file with original
- Stream (default), or get the result all at once
- See the number of tokens used in each request
- dryrun mode shows you what would be sent and how many estimated tokens. Useful to estimate the max size of output.
- Incorporate tasks:
  - Generate git commit messages

## Installation

1. Clone this repository
2. make sure you have a .openai file in your home directory

## Usage

2. run dist/index.js
3. Optionally, create a symbolic link to dist/index.js somewhere in your path. Alternatively, create an alias.
4. Set up your API key using one of these methods:

- **OPENAI_API_KEY** in your environment
- put the API key in ~/opeanai

## modes

### command line

```
gish tell me a joke
gish "What is the population of the city of London?".
```

Note the quotes. Without the quotes, the shell will try to interpret the question mark, and you'll get an error.

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
Alternatively you could do something like

```
gist < foo
```

where foo's content is

```
ask tell me a joke
```

### Command line usage

- gish --help -- shows all the different options
- gish tell me a joke
- gish "what is the population of San Francisco?". You need the quotes so that the shell doesn't complain about the '?'.
- gishe -e -- puts you in your editor and sends the content when you're done. To abort, either don't create the file, or empty it.
- gish -e foo.txt -- same as the previous option except that use an existing file.
- gish -i foo -- sends the content of foo. Equivalent to cat foo | gish.
- gish -m gpt-4 -- specify the model
- gish -p foo -- use foo as a prompt in a chat. You can use other flags or arguments to pass the actual request, but this is uses as the background. See https://platform.openai.com/docs/guides/chat. Gish sets this prompt as the first in the chat with the role of assistant.

### Interactive mode

- Interactive mode lets you type requests directly and pushing Enter sends the requests.
- You don't need to worry about escaping special characters.

## priority

Similar to linux commands like cat and echo, the following is how Gish prioritized the arguments and flags:

1. command line args: gish "What is the population of the city of London?". Note the quotes. Without the quotes, the shell will try to interpret the question mark, and you'll get an error.
2. piped input: echo "What is the population of the city of London?" | gish
3. interactive mode: gish. Similar to typing "python" or "node" at the command line.

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

```
