_reefer_ helps to keep source code and documentation files that refer to links
on [telegram.org](https://telegram.org) fresh.

It can:

1. Extract refs with URLs and timestamps from the source code.
2. Collect commits info for the pages from
   [MarshalX/telegram-crawler](https://github.com/MarshalX/telegram-crawler)
   repo.
3. Decide what files are outdated.
4. Generate message for a tracking issue in Markdown format.

## Referencing Pages

Refs are in format: `@ref{<URL>}(<timestamp>)`.

- `<URL>` — URL of the page to reference (parsed with `new URL`).
- `<timestamp>` — date when the page was referenced (parsed with `new Date`).

Refs are parsed from the comments in the source code.

The following formats are supported:

- JavaScript via [oxc-parser](https://www.npmjs.com/package/oxc-parser): `.js`,
  `.ts`, `.jsx`, `.tsx`, `.cjs`, `.mjs`
- Markdown via RegExp: `.md`

Examples:

<details>
<summary>JavaScript</summary>

```js
/** @ref{<URL>}(<timestamp>) */
```

```js
// @ref{<URL>}(<timestamp>)
```

</details>

<details>
<summary>Markdown</summary>

```md
<!-- @ref{<URL>}(<timestamp>) -->
```

</details>
