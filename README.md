# Castor - A very no-frills podcast app.

## Build Requirements

- node
- electron v.8.3+
- electron-forge v.5.2.4

## Running Development

```
npm start
```

## Current Issues

### Electron 

We're encountering errors with `electron-forge` 6.x* (not surprising as it's in beta) but we're also encountering issues with `electon` v.8.2** (`electron-forge`'s bundled `electron`).

Consequently, we're using `electron-forge` for packaging, but using `electron .` for starting in dev mode.

* Appears to be config or promise issue:

```
The "file" argument must be of type string. Received an instance of Object
```

** Private variable syntax isn't allowed:

```
SyntaxError: /Users/gturner/Documents/dev/electron/castor/src/classes/podcast.js: Unexpected character '#' (2:2)
  1 | class Podcast {
> 2 |   #player
    |   ^
  3 |   #cacheKey
  4 |   #stateKey
```

Guessing this is an issue with how `electron-forge` is transpiling the code.

## Contact

Glenn Turner
development@peccaui.com
