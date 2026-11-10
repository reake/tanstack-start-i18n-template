# Third-party notices

## Fonts

The bundled webfonts use the SIL Open Font License, version 1.1. The complete
license text is in [`LICENSES/OFL.txt`](./LICENSES/OFL.txt).

| Font     | File                                | Upstream source                                                                                                                                 | Copyright notice                                                                                                                | Changes                                       |
| -------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Fraunces | `public/fonts/fraunces-latin.woff2` | [Google Fonts Fraunces](https://github.com/google/fonts/tree/main/ofl/fraunces), upstream [Fraunces](https://github.com/undercasetype/Fraunces) | Copyright 2018 The Fraunces Project Authors (https://github.com/undercasetype/Fraunces)                                         | Latin subset in WOFF2; no design modification |
| Lexend   | `public/fonts/lexend-latin.woff2`   | [Google Fonts Lexend](https://github.com/googlefonts/lexend)                                                                                    | Copyright 2018 The Lexend Project Authors (https://github.com/googlefonts/lexend), with Reserved Font Name “RevReading Lexend”. | Latin subset in WOFF2; no design modification |

## Images

`public/logo.png`, `public/og-image.png`, and `public/favicon.ico` are project-owned
geometric placeholder assets. The default Apple touch icon uses `public/logo.png`.
These assets are licensed
under MIT with the rest of this repository and contain no third-party brand
elements. Regenerate them with `pnpm assets:generate`.

## Dependency licenses

Run `pnpm licenses:generate` to update [`LICENSES/third-party.md`](./LICENSES/third-party.md) from the lockfile.
