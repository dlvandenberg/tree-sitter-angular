<h1 align="center"> ✨ Tree Sitter Grammar for Angular ✨ </h1>

<h4 align="center">
    <img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/dlvandenberg/tree-sitter-angular/ci.yml">
    <img alt="Angular" src="https://img.shields.io/badge/Angular-v17-AF21EA?logo=angular&logoColor=F51365">
</h4>

## Specification

This parser is a complete rewrite of steelsojka's [tree-sitter-angular](https://github.com/steelsojka/tree-sitter-angular/tree/main).
This parser extends [tree-sitter-html](https://github.com/tree-sitter/tree-sitter-html) because the new _Control Flow_ syntax is not valid HTML code.

## Supported Features

- [x] Structural Directives
- [x] Property binding
- [x] Event binding
- [x] String interpolation
- [x] If-statements (v17)
- [x] For-statements (v17)
- [x] Switch-statements (v17)
- [x] Defer-statements (v17)

## Filetype

By default Angular's template files are marked as HTML. In order for this parser to work, it has to be marked as `angular`.
Currently Neovim does not do that yet, so to tell nvim-treesitter to user tree-sitter-angular, either put

```
autocmd BufRead,BufEnter *.component.html set filetype=angular
```

in `~/.config/nvim/ftdetect/angular.vim`, or put

## Issues

If you experience any issues, please feel free to open an issue with the code that's causing problems.
