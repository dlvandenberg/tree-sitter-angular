# tree-sitter-angular

Tree-sitter Grammar for Angular.

## Specification

This parser extends [tree-sitter-html](https://github.com/tree-sitter/tree-sitter-html).

## Troubleshooting

### Filetype

By default Angular's template files are marked as HTML. In order for this parser to work, it has to be marked as `angularhtml`.
Currently Neovim does not do that yet, so to tell nvim-treesitter to user tree-sitter-angular, either put

```
autocmd BufRead,BufEnter *.component.html set filetype=angularhtml
```

in `~/.config/nvim/ftdetect/angular.vim`, or put

```
vim.filetype.add({
    extension = {
        component.html = "angularhtml"
    }
})
```

in `~/.config/nvim/ftdetect/angular.lua`.

