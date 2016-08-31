# Slides Generator

Slides generator is a tool to automatically generate slides from git's commits history.
Just write code as usual, comment on particular lines, commit each stage and after runing generator every commit will be converted to slide and the whole branch becomes a slides deck.

## How to start?

Start from thinking about application you want to write. It shouldn't be full-featured project like you would
do at your work. Focus on creating a *Tutorial* - it should have as little as possible and as necessary (minimal examples, avoid unecessary files, lines, etc). Extended content can be added in annotations or during the speech.

1. Start a new branch using
```bash
$ git checkout --orphan <branchname> # orphan = without any history
```
1. Write the first commit (try to do it from scratch; don't use any starters)
1. Each commit has to be executable (don't do commits that does not compile / run)
1. For commit messages use following pattern: `Detailed description [Slide name]`.
```bash
$ git commit -am "Marking todos as completed [Completed]"
```
1. When you have all the commits ready run `git-to-slides`.

## How to run `git-to-slides`?

1. Fetch [Git-To-Slides](../static/git-to-slides.tar.gz)
1. Unpack and install dependencies:
```bash
$ tar xf git-to-slides.tar.gz
$ cd git-to-slides && npm install
```
1. Run in watch mode using
$ npm start ../path/to/myproject

1. Your slides are generated to `./git-to-slides/slides` copy them to your project.
```bash
$ cd ../path/to/myproject                   # go to your project
$ git checkout -b gh-pages --orphan         # or just `git checkout gh-pages`
$ cp -r ../path/to/git-to-slides/slides/* . # copy slides
$ git add .                                 # add them to version control
$ git commit -am "My First slides"          # commit (message does not matter)
$ git push -u origin gh-pages               # push to origin
```

1. You can commit your slides to `gh-pages` branch and it will be served by Github.
```
https://<yourname>.github.io/<reponame>/slides
```

## I've made a mistake, what now?

No worries, you have two options.
1. You can just fix stuff on generated slides (it's just HTML)
1. or you can rewrite git history and regenerate slides

### Rewriting history

Use git's interactive rebase to rewrite history (or messages).

1. First enter interactive rebase mode
```bash
$ git rebase -i HEAD^^^ # Go back 3 commits (HEAD~3)
```
1. Editor will popup. You can change commit messages or mark one of the commits as `edit` (instead of `pick`)
```generic
edit 1669f89 Universal Module Definition [UMD]
pick 8f8a793 Require.js z użyciem zewnętrznej biblioteki [Shim]
pick 16b8ce2 Jak zarządzać zależnościami - Bower lub NPM [Zależności]
pick 9ed385c Ładowanie przez System.js i zarządzanie przez JSPM [System.js + JSPM]
```

1. You will now be able to modify state after the commit marked as `edit`.
1. Make changes and commit them.
```bash
$ git commit --amend -a --no-edit
```
1. Apply other commits on top with
```bash
$ git rebase --continue
```
1. In case you have any conflicts fix them and commit.
```bash
$ git commit -a #remove 'Conflicts' from commit message
```
1. And continue with rebase until you get to `HEAD`
```bash
$ git rebase --continue
```


### Create separate branch

You can also create another branch and `cherry-pick` all the commits from the one that you want to edit.

## Comments format

In comments try to explain why you write this line instead of what happens in this line. Use comments syntax that is natural for your language (if `git-to-slides` doesn't support it please let us know).

1. By default comment will highlight line directly below it.
```js
// We will be using React framework
import React from 'react';
```
1. Sometimes you need to highlight more lines
```js
//3/ At first we avoid using any random number generator
function rollDice() {
     return 4;
}
```

1. Order of comments is determined by the position, but you can provide order explicitly
```html
<!-- 6/ 3. ..and this is what the whole form looks like -->
<form>
     <!-- 1. Let's ask user for her name. -->
     <input type="text" placeholder="Your name" class="form-control">
     <!-- 2. She needs a button to send the form... -->
     <button class="btn btn-primary">Send!</button>
</form>
```

## Detailed documentation

Some files have special meaning for `git-to-slides`.

### `_annotations.html`

Extended description of stuff displayed in popup (annotations).

- `details` - Any HTML visible as first when you enter the slide. Should describe what we are about to do.
- `aside` - Side notes to code annotations (comments)
- `aside[file]` - name of a file
- `aside[order]` - comment's number

###### Example
```html
<details>
  Rozpoczynamy od napisania SPA w czystym JS. Korzystamy z HTML5 i na początek ładujemy
  nasze skrypty korzystając z tagów <code>script</code> w <code>HEAD</code>.
</details>
<aside file="index.html" order="2">
  Możemy wrzucać też skrypty pod koniec tagu <code>body</code> lub (o ile się da) skorzystać z atrybutu <code>async</code>
</aside>
```

### `_tasks.html`

Extended description of stuff displayed in popup (annotations).

- `xp-tasks` - Tasks slide. Any content apart of `li` will be displayed as header.
- `xp-tasks[time]` - Time for tasks in minutes
- `xp-tasks li[class="xp-basic"]` - Basic task (html/markdown)
- `xp-tasks li[class="xp-advanced"]` - Advanced task (html/markdown)
- `xp-tasks li[class="xp-extra"]` - Extra task definition (html/markdown)

###### Example
```html
<xp-tasks time="120">
  <h1>Sprint 4</h1>
  <h3>Very important Sprint</h3>
  <ol>
    <li class="xp-basic">Basic task 1</li>
    <li class="xp-advanced">Advanced task 1</li>
    <li class="xp-extra">Extra task 1</li>
  </ol>
</xp-tasks>
```

### `_xp-tree`

Put this file to the workspace if you want your files to be displayed as tree (usefull when you want to show the structure of your project).

###### Example
This file does not need any content.

### `_xp-no-highlight`

Contains paths to files that should be skipped when parsing comments (we never want this file to be displayed on popup).

###### Example
```
jspm_packages/system.js
jspm_packages/system.js.map
```

### `_console`

File simulating commands that you should run in the console. Don't remove commands between  commit messages - just append new commands, but remove comments from previous ones - on last slide participants will have a full list of commands that should be run for the project.

###### Example
```bash
# To use react in webpack first we need to install it and save in `package.json`
$ npm install react --save
```

### `_xp-preview-file`

By default for HTML runners we will be displaying `index.html` page from your workspace. Use this file to specify different page to be displayed in preview.

###### Example
```
index-test.html
```

### `_xp-no-preview`

Put this file to the workspace if you don't want the preview do be generated for you (usefull for non-supported technologies)

###### Example
This file does not need any content.

### `_xp-runner`

Type of runner to be used when executing slide content. Supported runner names can be found in [API documentation](/docs)

###### Example
```
html-ts
```

