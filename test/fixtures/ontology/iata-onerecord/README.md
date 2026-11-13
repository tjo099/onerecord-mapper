# IATA ONE Record ontology (vendored test fixtures)

These files are copies of IATA's own ONE Record ontology files. They are test
fixtures only: the ontology conformance guard in `test/unit/ontology/` checks
the package's Zod schemas against them, using the extractor in
`test/util/ontology-extract.ts`. They are outside the `package.json` `files`
list, so they are never published.

- Repository: <https://github.com/IATA-Cargo/ONE-Record>
- Commit: `49e8ac1bfdc24d76fddf307e87f36e381b6941b1`
- Fetched: 2026-11-13
- Licence: MIT. [`LICENSE`](LICENSE) is the repository-root licence text,
  copied verbatim from
  <https://raw.githubusercontent.com/IATA-Cargo/ONE-Record/49e8ac1bfdc24d76fddf307e87f36e381b6941b1/LICENSE>.

## Files

| File | Ontology | Upstream raw URL | sha256Lf |
|---|---|---|---|
| `2025-07-standard/IATA-1R-DM-Ontology.ttl` | cargo 3.2 | <https://raw.githubusercontent.com/IATA-Cargo/ONE-Record/49e8ac1bfdc24d76fddf307e87f36e381b6941b1/2025-07-standard/Data-Model/IATA-1R-DM-Ontology.ttl> | `0c34e8ed0e1f7203817f554d1a6adbadbf1b172809739e8d5b492f8cde59a1ee` |
| `2025-07-standard/IATA-1R-CL-Ontology.ttl` | code-lists 1.1.0 | <https://raw.githubusercontent.com/IATA-Cargo/ONE-Record/49e8ac1bfdc24d76fddf307e87f36e381b6941b1/2025-07-standard/Data-Model/IATA-1R-CL-Ontology.ttl> | `3019dd9b0f94252f702b604bcd27ca2af2c68d74e6113b32ee676700248c9c61` |
| `2026-07-standard/IATA-1R-DM-Ontology.ttl` | cargo 3.3.0 | <https://raw.githubusercontent.com/IATA-Cargo/ONE-Record/49e8ac1bfdc24d76fddf307e87f36e381b6941b1/2026-07-standard/Data-Model/IATA-1R-DM-Ontology.ttl> | `b15e2646e88a9caed3de674568f315d7ca09ee9c7d2943b71411b6ca1c452f03` |

`sha256Lf` is the hex SHA-256 of the file's UTF-8 text after `\r\n` is
normalised to `\n`, as computed by `sha256Lf()` in
`test/util/ontology-extract.ts`. The same values are pinned there in
`VENDORED_SHA256`, and a unit test checks that the two agree.

## Line endings: CR characters were stripped

Each file was fetched from its raw URL above and then copied with every CR
character stripped (`tr -d '\r' < fetched > <file>`, equivalent to
`curl -sSfL <url> | tr -d '\r' > <file>`). `.gitattributes` keeps them LF.

- Upstream, the 3.2 DM file uses CRLF line endings. The 3.2 CL file, the
  3.3.0 DM file and `LICENSE` are already LF, so for them the copy is
  byte-identical to upstream.
- No upstream file contains a CR outside a CRLF pair. Stripping CRs is
  therefore exactly CRLF-to-LF normalisation: it does not change the line
  count, and `Lnnnn` line citations in the specification match these files.
- Because only the 3.2 DM file changed, its raw upstream bytes have a
  different SHA-256 from its `sha256Lf`:
  `1cc9ff0f8d11d2ebeb0562629c375cd5a8737adccbc4bd0372d6429981ddcda0`.

## Not vendored

The 3.3.0 code-list file
(`2026-07-standard/Data-Model/IATA-1R-CL-Ontology.ttl`) is not vendored. Per
the specification review, it differs from the 3.2 code-list file only in
whitespace, so the 3.2 file stands for both.

## Re-pinning

Change the commit in the URLs above, re-fetch each file with
`curl -sSfL <url> | tr -d '\r' > <file>`, then update the table and
`VENDORED_SHA256` and run `bun run test test/unit/ontology`.
