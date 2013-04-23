Recipe for Chinstrap
====================

## 1. Start with [Resig-style Tmpl Templates](http://ejohn.org/blog/javascript-micro-templating/)

The intent here is simple: A chinstrap template is fundamentally a php/jsp/asp style template, which means <% code-goes-here %> and <%= this %> should insert the value as a string. 

  1. Chinstrap templates are _logicful_.
  2. Chinstrap has no opinion on whether this is a good idea.
  3. Chinstrap suspects refusing _all_ logic from a template means you trade a localized complexity problem for a layering complexity problem.
  4. Chinstrap thinks that's up to you.
  5. Chinstrap does not pretend that having conditionals and loops in your template isn't logic.
  6. Chinstrap logic strives to be as much like regular logic as possible.
  7. Chinstrap adds some alternate logic that is _optional_.
  8. Chinstrap is easygoing, and is cool with you disagreeing.

## 2. Swap in [Mustache](http://mustache.github.io/) / [Handlebars](http://handlebarsjs.com/) Syntax Denotation

  1. Chinstrap thinks <% syntax %> results in code that looks too much like the markup in which it lives.
  2. Chinstrap thus uses {{ code-goes-here }} and {{= value }}. Also at this point, most people will see that notation and know what it means.

## 3. Add a bit of syntactic sugar to manage some of the detritus of regular js code.

  1. Chinstrap thinks template code should be like real code, but still be concise and clear.

The above choices leave us with situations like

```
{{ for (var i=0, len=items.length; i<len; i++) { }}
...
{{ } }}
```

That last one really kills me. That is illegible. So chinstrap offers a small layer of shorthand. The basic idea is, take the existing syntax, capitalize the key word, like WHILE or FOR, and chinstrap will assume the rest of the line is the expression you intended. So for example:

```
{{ FOR var i=0, len=items.length; i<len; i++ }}
...
{{ /FOR }}
```

Compiles into:

```javascript
for ( var i=0, len=items.length; i<len; i++) {
...
}
```

Notice also the /FOR. It's a straight-through swap for "}", but infinitely clearer on what it's closing. There's one of these for all the shorthand options.

## 4. On the matter of loops and values.

  1. Chinstrap thinks you should be able to use methods in your data objects, if you want.
  2. Chinstrap thinks you shouldn't have to worry about whether something is a method or not.
  3. Chinstrap hates typing.

When you insert a value using 

```
{{= item.value }}
```

chinstrap will inspect your insertion, and call value as a function if that's possible, or simply return the value otherwise.

 As a convenience, you can also define an iterator shortcut for loops. (Or anything really. Chinstrap isn't picky.) To define the iterator's value, use

```
{{ @= item }}
```

To use it, simply call

```
{{= @name }}
```

Under the hood, Chinstrap will replace "@" with "item." Which means you can use @ to represent any object with properties and/or methods. Then Chinstrap will check if name is a method or a value, and respond appropriately.

