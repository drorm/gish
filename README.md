# gish

# Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Using npm](#using-npm)
  - [Download an executable](#download-an-executable)
  - [From source](#from-source)
- [Usage](#usage)
  - [Modes](#modes)
    - [Command Line](#command-line)
    - [Piped](#piped)
    - [Interactive Mode](#interactive-mode)
  - [Command Line Usage](#command-line-usage)
    - [CLI History](#cli-history)
    - [CLI Chat mode](#cli-chat-mode)
    - [CLI Extra flags](#cli-extra-flags)
  - [Interactive Mode](#interactive-mode-1)
    - [Interactive Chat mode](#interactive-chat-mode)
  - [#Import](#import)
  - [#Diff: Changing and Diffing a File](#diff-changing-and-diffing-a-file)
  - [Generate multiple files](#generate-multiple-files)
  - [Examples](#examples)
  - [Log File](#log-file)
  - [Priority](#priority)
  - [Stats](#stats)

Gish is a command-line interface(CLI) that interacts with OpenAI GPT following Unix conventions and offering a rich set of features via flags. It is important to note that a paid OpenAI account and API key are required to use Gish.

## Features

Gish offers the following features:

- Command line, piped, or interactive mode that allows users to easily interact with the application
- Generate a full application with a single request!
- Integration of files into prompts using the `#import` statement
- Diff-ing generated files with the original using the `#diff` statement or the `-d` flag
- A local history containing user prompts and responses for easy reference and modification
- Saving responses for later use
- A flag to save code to a file
- Streaming or receiving the result all at once
- Displaying the number of tokens used in each request
- Displaying a dry-run mode which shows users what would be sent and how many estimated tokens would be used
- Automatic generation of Git commit messages and an option to edit them before submission

## Screencast

[![Screencast](https://asciinema.org/a/570434.png)](https://asciinema.org/a/570434)

## Installation

### Using npm

```
npx gish-gpt
```

or

```
npm install gish-gpt
node_modules/.bin/gish
```

### Download an executable

1. Visit the [**Releases**](https://github.com/drorm/gish/releases) page of this repository.
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
# gish tell me a joke
Why was the math book sad? Because it had too many problems.
# gish "What is the population of the city of London?".
The population of the City of London is approximately9 million, as of 2021.
```

Without quotes, the shell will interpret the question mark in the second request and cause an error.

#### Piped

Piped input:

```
#echo "What is the population of the city of London?" | gish
The estimated population of the city of London is around 9 million people.
```

#### Interactive Mode

```
# gish.
> tell me a joke
Why did the tomato turn red? Because it saw the salad dressing!
```

This is similar to typing "python" or "node" at the command line.

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
- `gish "what is the population of San Francisco?".` You need the quotes to avoid shell errors.
- `gish -e` puts you in your editor and sends the content when you're done. To abort, either don't create the file or empty it
- `gish -e foo.txt` does the same but operates on an existing file.
- `gish -h [num]` shows you the history. Num is optional and defaults to 20.
- `gish -i foo` sends the content of foo. Equivalent to `cat foo | gish`.
- `gish -m gpt-4` specifies the model
- `gish -p foo` uses foo as a prompt in a chat. Other flags or arguments are used to pass the actual request but this is the background. See https://platform.openai.com/docs/guides/chat. Gish sets this prompt as the first in the chat with the role of "system".
- `gish -s foo.ts` saves the output to foo.ts. When generating code, the user needs to use a prompt that generates the appropriate output. See prompts/coding for an example.
- `gish -d foo.ts` diff the result with this file. Requires -s.
- `gish -c [num]` activates the chat mode and refers to the num request, defaults to the previous one. See the chat section for more details.
- `gish -g` Generates multiple files to create a full application. See the generate section for more details.
- `gish -x` Extra arguments to pass to gpt. Example: -x '"temperature"=0.5:"max_tokens"=500'.

#### CLI History

As in your shell -h or --history shows the history of your requests. The optional **num** param specifies the number of elements. The defaults is 20.

#### CLI Chat mode

Chat mode provides a similar experience to https://platform.openai.com/chat where you can refer to previous requests.

```
# gish what is the capital of japan
The capital of Japan is Tokyo.
# gish -c population
The estimated population of Tokyo, Japan as of2021 is approximately 13.9 million people.
```

Using the history feature, you can see the position of requests in the history and pass them in the -c parameter.

```bash
# gish tell me a joke
Why did the tomato turn red? Because it saw the salad dressing!
# gish tell me a one line story
She found love in the most unexpected place.
# gish -h 2
892: tell me a joke
893: tell me a one line story
# gish -c 892 another
Why did the bicycle fall over? Because it was two-tired!

```
#### CLI Extra flag
See the [chat API docs] (https://platform.openai.com/docs/api-reference/chat) for the list of flagas you can use. This feature is for advanced users, but the API will typically error if you pass it flags that are not supported.
> **Warning**
> the string you pass **needs** to be valid JSON. Specifically make sure that any string are enclosed in double quotes on both sides of the ':'. This is JSON, not javascript!
Example:
```
# gish -x '"temperature":0.5,"max_tokens":5' tell me a joke
Why did the tomato turn
```
Made it chop the response after 5 tokens.

### Interactive Mode

- Interactive mode lets you type requests directly one after the other.
- You don't need to worry about escaping special characters
- Supports CTRL-P, CTRL-N and other [GNU readline](https://en.wikipedia.org/wiki/GNU_Readline) shortcuts.
- Type `chat` and the request to enter chat mode. Type exit to leave chat mode.

#### Interactive History

Type **history** with an optional number to view the history. The default is 20.

#### Interactive Chat mode

Chat mode provides a similar experience to https://platform.openai.com/chat where you can refer to previous requests.

```
> 10 miles to km
16.0934 km.
> chat how about 40
40 miles is equal to64.3736 kilometers.
Chat > how about 50
50 miles is equal to80.4672 kilometers.
Chat > exit
> how about 30
30 is a positive integer that comes after29 and before 31.
```

- Notice how the prompt changes in chat mode.
- Since the last question is not in chat mode, GPT doesn't answer about conversion.
- Chat defaults to the previous request, but you can also use earlier requests. 
  - Use history to find the position of earlier requests.
  - Pass the request positing as an argument to chat as in the following example.
```
chat 876 another
```

### #Import

Use the `#import` statement in your input file to include prompts or comments/text that you want ChatGPT to react to.
**Example**

```

#import ~/work/gish/tasks/coding.txt
The above program prints hello world. Change it to print goodbye world.
#import hello.ts

```

Here is the content of `tasks/coding.txt`:

```

I want you to act as a coding collaborator. I will ask you software questions and you will answer with code.
Your response for this request needs to be code and nothing else.
Only provide comments if they provide important extra information and they should be brief and to the point. The contents should be in the code as comments at the top of the file.

---

```

This is the typical workflow when using gish for coding:

1. Use a standard prompt to define the code handling.
2. Tell the bot what it should do.
3. Tell it which file it needs to work on.

### #Diff: Changing and Diffing a File

Use the `#diff` option when you want GPT to makes changes to a file and then diff it:

```

#import ~/work/gish/tasks/coding.txt
In the following file, document the code better
#diff settings.ts

```

This process is similar to `#import`, but also lets the app know that the user is modifying the file. Once the code is generated, the diff command defined in `settings.ts` is launched on the original and generated files. **For complex changes, Copilot might work better.**

### Generate multiple files

With the appropriate prompt such as [Web application] (tasks/webapp.txt), you can get the LLM, GPT-4 is recommended for this, but experiment and see what works for you.
Simply creating an input file

```
#import tasks/webapp.txt

Generate Conway's game of life.
Include on the page, the instructions on how to play the game.
```

and then running

```
gish -m gpt-4 -g life -i /input
```

Resulted in the game of life in the "life" directory.

> **Warning**
>
> Be aware that using this approach it's easy to use many tokens, specifically with GPT-4, so the costs can add up.

### Examples

See the [Examples] (examples) dir for ways to use gish to:

- Code a new feature
- Ask about a typescript error
- Interpret a TypeScript error
- generate unit tests

Here is a shell script example that uses gish to generate a git commit message and drop users in the editor with the message prepopulated:

```shell
#!/bin/bash
out="The following is the output of git diff"
out+=`git diff $*`
out+="-----------------------------"
out+="The following is the output of git status"
out+=`git status --untracked-files=no $*`
out+="-----------------------------"
out+="based on the above provide a commit message"
git commit -e -m "`echo $out | gish --no-stats`" $*
```

### Log File

The log file, ~/.gish/history.json behaves as the log of your conversations with ChatGPT. Since it's a standard file, you can use an editor or a pager to look at the history of your interactions with ChatGPT
It includes:

- A timestamp of a request
- The messages: your request, GPT's response as well as chat history if applicable
- The response
- Number of tokens
- The duration
- The ballpark cost

## priority

Similar to linux commands like cat and echo, the following is how Gish prioritized the arguments and flags:

1. Command line args: gish "What is the population of the city of London?". Note the quotes. Without the quotes, the shell will try to interpret the question mark, and you'll get an error.
2. Piped input: echo "What is the population of the city of London?" | gish
3. Interactive mode: gish. Similar to typing "python" or "node" at the command line.

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

```

```
