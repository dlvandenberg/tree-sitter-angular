<h1 align="center"> ✨ Tree Sitter Grammar for Angular ✨ </h1>

<h4 align="center">
    <img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/dlvandenberg/tree-sitter-angular/ci.yml">
    <img alt="Angular" src="https://img.shields.io/badge/Angular-v17-AF21EA?logo=angular&logoColor=F51365">
    <img alt="Tree-sitter CLI version" src="https://img.shields.io/github/package-json/dependency-version/dlvandenberg/tree-sitter-angular/dev/tree-sitter-cli/main">
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
Currently Neovim does not do that yet, so to automatically set the filetype for Angular components, put:

```
autocmd BufRead,BufEnter *.component.html set filetype=angular
```

in `~/.config/nvim/ftdetect/angular.vim`.

Alternatively, you can use `:set filetype=angular` on a given buffer.

## Plugins

As this parser works on `angular` filetypes, it will cause other plugins to possibly not work correctly. Below are some fixes for the plugins that I use which I had to modify.

### VonHeikemen/lsp-zero.nvim

Add this to your config:

```lua
    local config = require("lspconfig")
    local util = require("lspconfig.util")

    config.angularls.setup({
      root_dir = util.root_pattern("angular.json", "project.json"), -- This is for monorepo's
      filetypes = { "angular", "html", "typescript", "typescriptreact" },
    })
```

### stevearc/conform.nvim

Add this to your config:

```lua
    conform.setup({
      formatters_by_ft = {
        angular = { "prettier" },
      }

      ...
    }
```

### numToStr/Comment.nvim

Add this to your config:

```lua
  config = function()
    local comment = require("Comment")
    local ft = require("Comment.ft")

    local commentstr = "<!--%s-->"

    ft.set("angular", { commentstr, commentstr })

    comment.setup()
  end,
```

### tpope/vim-commentary

Add this to `~/.config/nvim/ftdetect/angular.vim`:

```
autocmd FileType angular setlocal commentstring=<!--%s-->
```

### L3MON4D3/LuaSnip

Add this to your config:

```lua
local ls = require('luasnip');
ls.filetype_extend('angular', { 'html' })
```

### nvimtools/none-ls.nvim

Add `angular` to `extra_filetypes` wherever needed.

For example:

```lua
require('null-ls').setup({
  sources = {
    null_ls.builtins.formatting.prettierd.with({
      extra_filetypes = { 'angular' }
    }),
  },
});

```

## Issues

If you experience any issues, please feel free to open an issue with the code that's causing problems.
