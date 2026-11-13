/**
 * Typed, dependency-free reader for the vendored IATA ONE Record ontology
 * files in `test/fixtures/ontology/iata-onerecord/` (spec §9.2).
 *
 * It understands the Turtle layout that IATA's ontology files use, not Turtle
 * in general:
 *
 * - A class block starts at column 0 with `:Name rdf:type owl:Class` (DM file)
 *   or `<https://onerecord.iata.org/ns/code-lists/Name> rdf:type owl:Class`
 *   (CL file). It ends at the first line whose last token is `.` at bracket
 *   depth 0. Brackets, `.` and `#` inside string literals (including
 *   multi-line `"""…"""` literals) and inside `<IRI>`s do not count.
 * - Named superclasses are the `:X` objects of the block's own
 *   `rdfs:subClassOf`.
 * - A bracket is a restriction only when it opens with
 *   `[ rdf:type owl:Restriction`, and it must be a direct `rdfs:subClassOf`
 *   object. Inside it, only `owl:onProperty`, `owl:allValuesFrom` and
 *   `owl:maxCardinality "1"` are understood. Anything else is an error, but
 *   that error is raised only when the class is read: as a requested class,
 *   or as an intermediate superclass of one. 3.3.0's `:LogisticsEvent`
 *   legitimately carries an `owl:minCardinality` (spec §9.2 erratum), so an
 *   unrelated class must not break extraction.
 * - Other brackets, such as `owl:equivalentClass [ rdf:type owl:Class ;
 *   owl:oneOf ( … ) ]`, are not restrictions. `owl:oneOf` lists are read
 *   directly on the class or nested in `owl:equivalentClass`.
 *
 * Malformed Turtle in a class block, an unterminated block or a duplicate
 * class declaration throws eagerly, whichever class is requested: the vendored
 * files are pinned by hash, so any of these means the extractor and the files
 * disagree.
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

export type PropertyKind = 'literal' | 'code' | 'iri' | 'embedded'

export interface ExtractedProperty {
  /** The `owl:allValuesFrom` object as written: `xsd:double`, `:BookingOption`, `codes:ChargeCode`. */
  range: string
  kind: PropertyKind
  /** False exactly when an `owl:maxCardinality "1"` restriction applies. */
  many: boolean
  /** 1-based line of `:name rdf:type owl:ObjectProperty|DatatypeProperty`, or null if absent. */
  declLine: number | null
  /** Local name of the class whose restrictions declare the property. */
  from: string
}

export interface ExtractedClass {
  /** 1-based line of the class declaration. */
  line: number
  /** Direct named superclasses (`rdfs:subClassOf :X`), as local names. */
  superclasses: string[]
  properties: Record<string, ExtractedProperty>
}

const VENDOR_ROOT = new URL('../fixtures/ontology/iata-onerecord/', import.meta.url)

/** `sha256Lf` of each vendored TTL file, keyed by its path relative to the vendor root. */
export const VENDORED_SHA256: Readonly<Record<string, string>> = Object.freeze({
  '2025-07-standard/IATA-1R-DM-Ontology.ttl':
    '0c34e8ed0e1f7203817f554d1a6adbadbf1b172809739e8d5b492f8cde59a1ee',
  '2025-07-standard/IATA-1R-CL-Ontology.ttl':
    '3019dd9b0f94252f702b604bcd27ca2af2c68d74e6113b32ee676700248c9c61',
  '2026-07-standard/IATA-1R-DM-Ontology.ttl':
    'b15e2646e88a9caed3de674568f315d7ca09ee9c7d2943b71411b6ca1c452f03',
})

/** Hex SHA-256 of `text` after `\r\n` → `\n` normalisation, hashed as UTF-8. */
export function sha256Lf(text: string): string {
  return createHash('sha256').update(toLf(text), 'utf8').digest('hex')
}

/** Reads a file relative to `test/fixtures/ontology/iata-onerecord/`, with `\r\n` → `\n`. */
export function readVendored(relPath: string): string {
  return toLf(readFileSync(new URL(relPath, VENDOR_ROOT), 'utf8'))
}

/**
 * Extracts the named classes. With `inherit: 'intermediate'`, properties of
 * superclasses up to, but not including, `:LogisticsObject` are merged in.
 * Throws on an unknown class name, and on any restriction it does not
 * understand in a class it reads.
 */
export function extractClasses(
  ttl: string,
  names: readonly string[],
  opts: { inherit: 'none' | 'intermediate' } = { inherit: 'none' },
): Record<string, ExtractedClass> {
  const ontology = parseOntology(ttl)
  const result: Record<string, ExtractedClass> = {}
  for (const name of names) {
    const block = requireClass(ontology, name)
    const sources =
      opts.inherit === 'intermediate' ? [block, ...intermediateAncestors(ontology, block)] : [block]
    result[name] = {
      line: block.line,
      superclasses: [...block.superclasses],
      properties: mergeProperties(ontology, block, sources),
    }
  }
  return result
}

/**
 * Returns the values of an `owl:oneOf` enumeration, in file order: the local
 * name of each `:X` (DM file) or the `#fragment` of each
 * `<…/code-lists/Name#X>` (CL file). Throws if the class is unknown or has no
 * `owl:oneOf`.
 */
export function extractOneOf(ttl: string, className: string): string[] {
  const block = requireClass(parseOntology(ttl), className)
  if (block.oneOfErrors.length > 0) {
    throw new Error(`ontology-extract: ${className}: ${block.oneOfErrors.join('; ')}`)
  }
  if (block.oneOf === null) {
    throw new Error(`ontology-extract: class ${className} (L${block.line}) has no owl:oneOf`)
  }
  return [...block.oneOf]
}

// ---------------------------------------------------------------------------
// Model

interface Restriction {
  property: string
  allValuesFrom: string | null
  maxCardinalityOne: boolean
}

interface ClassBlock {
  name: string
  line: number
  superclasses: string[]
  restrictions: Restriction[]
  oneOf: string[] | null
  /** Raised only when the class is read (spec §9.2 erratum). */
  restrictionErrors: string[]
  /** Raised only by `extractOneOf` on this class. */
  oneOfErrors: string[]
}

interface Ontology {
  classes: Map<string, ClassBlock>
  declLines: Map<string, number>
}

const LOGISTICS_OBJECT = 'LogisticsObject'
const CODE_LIST_ELEMENT = 'CodeListElement'

const DM_CLASS = /^:(\w+) rdf:type owl:Class\b/
const CL_CLASS = /^<https:\/\/onerecord\.iata\.org\/ns\/code-lists\/(\w+)> rdf:type owl:Class\b/
const PROPERTY_DECL = /^:(\w+) rdf:type owl:(?:ObjectProperty|DatatypeProperty)\b/
const DEFAULT_PREFIX_NAME = /^:(\w+)$/
const CODE_LIST_MEMBER = /^<https:\/\/onerecord\.iata\.org\/ns\/code-lists\/\w+#([^#>]+)>$/

function toLf(text: string): string {
  return text.replace(/\r\n/g, '\n')
}

function requireClass(ontology: Ontology, name: string): ClassBlock {
  const block = ontology.classes.get(name)
  if (block === undefined) throw new Error(`ontology-extract: unknown class ${name}`)
  return block
}

// ---------------------------------------------------------------------------
// Reading classes

/** Superclasses of `block`, nearest first, stopping at (and excluding) `:LogisticsObject`. */
function intermediateAncestors(ontology: Ontology, block: ClassBlock): ClassBlock[] {
  const out: ClassBlock[] = []
  const seen = new Set<string>([block.name])
  const queue = [...block.superclasses]
  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    if (next === LOGISTICS_OBJECT || seen.has(next)) continue
    seen.add(next)
    const ancestor = ontology.classes.get(next)
    if (ancestor === undefined) {
      throw new Error(`ontology-extract: superclass ${next} of ${block.name} is not declared`)
    }
    out.push(ancestor)
    queue.push(...ancestor.superclasses)
  }
  return out
}

function mergeProperties(
  ontology: Ontology,
  requested: ClassBlock,
  sources: readonly ClassBlock[],
): Record<string, ExtractedProperty> {
  const properties: Record<string, ExtractedProperty> = {}
  for (const source of sources) {
    if (source.restrictionErrors.length > 0) {
      const via = source === requested ? '' : ` (superclass of ${requested.name})`
      throw new Error(
        `ontology-extract: ${source.name}${via}: ${source.restrictionErrors.join('; ')}`,
      )
    }
    for (const [property, { range, many }] of ownRestrictions(source)) {
      const nearer = properties[property]
      if (nearer !== undefined) {
        if (nearer.range !== range || nearer.many !== many) {
          throw new Error(
            `ontology-extract: ${requested.name}.${property} is restricted differently by ${nearer.from} and ${source.name}`,
          )
        }
        continue
      }
      properties[property] = {
        range,
        kind: classify(ontology, range, `${source.name}.${property}`),
        many,
        declLine: ontology.declLines.get(property) ?? null,
        from: source.name,
      }
    }
  }
  return properties
}

/** Combines the restrictions of one class per property, in first-seen order. */
function ownRestrictions(block: ClassBlock): Map<string, { range: string; many: boolean }> {
  const grouped = new Map<string, { ranges: Set<string>; many: boolean }>()
  for (const { property, allValuesFrom, maxCardinalityOne } of block.restrictions) {
    const entry = grouped.get(property) ?? { ranges: new Set<string>(), many: true }
    if (allValuesFrom !== null) entry.ranges.add(allValuesFrom)
    if (maxCardinalityOne) entry.many = false
    grouped.set(property, entry)
  }
  const out = new Map<string, { range: string; many: boolean }>()
  for (const [property, { ranges, many }] of grouped) {
    const [range, ...others] = ranges
    if (range === undefined || others.length > 0) {
      throw new Error(
        `ontology-extract: ${block.name}.${property} needs exactly one owl:allValuesFrom, found ${ranges.size}`,
      )
    }
    out.set(property, { range, many })
  }
  return out
}

/** Spec §9.2 kind order: literal, then code, then iri, then embedded. */
function classify(ontology: Ontology, range: string, where: string): PropertyKind {
  if (range.startsWith('xsd:')) return 'literal'
  if (range.startsWith('codes:') || range === `:${CODE_LIST_ELEMENT}`) return 'code'
  const name = DEFAULT_PREFIX_NAME.exec(range)?.[1]
  if (name === undefined) throw new Error(`ontology-extract: ${where}: unsupported range ${range}`)
  const target = ontology.classes.get(name)
  if (target === undefined) {
    throw new Error(`ontology-extract: ${where}: range ${range} is not a declared class`)
  }
  const lineage = lineageOf(ontology, target)
  if (target.oneOf !== null || lineage.has(CODE_LIST_ELEMENT)) return 'code'
  if (lineage.has(LOGISTICS_OBJECT)) return 'iri'
  return 'embedded'
}

/** The class itself and every transitive named superclass. */
function lineageOf(ontology: Ontology, block: ClassBlock): Set<string> {
  const lineage = new Set<string>([block.name])
  const queue = [...block.superclasses]
  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    if (lineage.has(next)) continue
    lineage.add(next)
    const ancestor = ontology.classes.get(next)
    if (ancestor === undefined) {
      throw new Error(
        `ontology-extract: superclass ${next} in the lineage of ${block.name} is not declared`,
      )
    }
    queue.push(...ancestor.superclasses)
  }
  return lineage
}

// ---------------------------------------------------------------------------
// Scanning: find class blocks and property declarations

function parseOntology(ttl: string): Ontology {
  const classes = new Map<string, ClassBlock>()
  const declLines = new Map<string, number>()
  const lexer = new LineLexer()
  let open: { name: string; line: number; tokens: Token[]; depth: number } | null = null

  const lines = ttl.split(/\r?\n/)
  for (let index = 0; index < lines.length; index++) {
    const text = lines[index] ?? ''
    const lineNo = index + 1
    if (open === null && !lexer.inString) {
      const className = (DM_CLASS.exec(text) ?? CL_CLASS.exec(text))?.[1]
      const propertyName = PROPERTY_DECL.exec(text)?.[1]
      if (className !== undefined) {
        open = { name: className, line: lineNo, tokens: [], depth: 0 }
      } else if (propertyName !== undefined && !declLines.has(propertyName)) {
        declLines.set(propertyName, lineNo)
      }
    }

    const tokens = lexer.lex(text, lineNo)
    if (open === null) continue
    for (const token of tokens) {
      open.tokens.push(token)
      if (token.type !== 'punct') continue
      if (token.value === '[') open.depth++
      if (token.value === ']' && --open.depth < 0) {
        throw new Error(`ontology-extract: ${open.name}: unbalanced ] at L${lineNo}`)
      }
    }
    const last = tokens.at(-1)
    if (open.depth === 0 && !lexer.inString && last?.type === 'punct' && last.value === '.') {
      if (classes.has(open.name)) {
        throw new Error(`ontology-extract: class ${open.name} is declared twice (L${open.line})`)
      }
      classes.set(open.name, readClassBlock(open.name, open.line, open.tokens))
      open = null
    }
  }
  if (open !== null) {
    throw new Error(`ontology-extract: class block ${open.name} (L${open.line}) is not terminated`)
  }
  if (lexer.inString) throw new Error('ontology-extract: unterminated """ string literal')
  return { classes, declLines }
}

function readClassBlock(name: string, line: number, tokens: readonly Token[]): ClassBlock {
  const statement = new BlockParser(tokens, name).parseStatement()
  const block: ClassBlock = {
    name,
    line,
    superclasses: [],
    restrictions: [],
    oneOf: null,
    restrictionErrors: [],
    oneOfErrors: [],
  }
  for (const { predicate, object } of statement) {
    if (predicate === 'rdfs:subClassOf') {
      const superclass = termName(object)
      if (superclass !== undefined) {
        block.superclasses.push(superclass)
        continue
      }
      if (isRestriction(object)) {
        readRestriction(block, object)
        continue
      }
    }
    if (predicate === 'owl:oneOf') readOneOf(block, object)
    if (predicate === 'owl:equivalentClass' && object.kind === 'bnode') {
      for (const inner of object.pairs) {
        if (inner.predicate === 'owl:oneOf') readOneOf(block, inner.object)
      }
    }
    rejectRestrictions(block, [object])
  }
  return block
}

/** The local name of a `:name` term, or undefined. */
function termName(node: Node): string | undefined {
  return node.kind === 'term' ? DEFAULT_PREFIX_NAME.exec(node.value)?.[1] : undefined
}

function isRestriction(node: Node): node is BnodeNode {
  if (node.kind !== 'bnode') return false
  const first = node.pairs[0]
  return (
    first?.predicate === 'rdf:type' &&
    first.object.kind === 'term' &&
    first.object.value === 'owl:Restriction'
  )
}

function readRestriction(block: ClassBlock, node: BnodeNode): void {
  const errors: string[] = []
  let property: string | null = null
  let allValuesFrom: string | null = null
  let maxCardinalityOne = false
  for (const { predicate, object } of node.pairs.slice(1)) {
    switch (predicate) {
      case 'owl:onProperty': {
        const name = termName(object)
        if (name === undefined || property !== null) errors.push('unsupported owl:onProperty')
        else property = name
        break
      }
      case 'owl:allValuesFrom':
        if (object.kind !== 'term' || allValuesFrom !== null) {
          errors.push('unsupported owl:allValuesFrom')
        } else {
          allValuesFrom = object.value
        }
        break
      case 'owl:maxCardinality':
        if (object.kind === 'literal' && object.lexical === '1') maxCardinalityOne = true
        else errors.push('unsupported owl:maxCardinality')
        break
      default:
        errors.push(`unknown restriction predicate ${predicate}`)
    }
    rejectRestrictions(block, [object])
  }
  if (property === null && errors.length === 0) errors.push('no owl:onProperty')
  if (property === null || errors.length > 0) {
    block.restrictionErrors.push(`${errors.join(', ')} in the owl:Restriction at L${node.line}`)
    return
  }
  block.restrictions.push({ property, allValuesFrom, maxCardinalityOne })
}

function readOneOf(block: ClassBlock, node: Node): void {
  if (block.oneOf !== null) {
    block.oneOfErrors.push(`second owl:oneOf at L${node.line}`)
    return
  }
  if (node.kind !== 'list') {
    block.oneOfErrors.push(`owl:oneOf at L${node.line} is not a ( … ) list`)
    return
  }
  block.oneOf = []
  for (const item of node.items) {
    const value = item.kind === 'term' ? oneOfValue(item.value) : undefined
    if (value !== undefined) block.oneOf.push(value)
    else block.oneOfErrors.push(`unsupported owl:oneOf member at L${item.line}`)
  }
}

/**
 * `:X` → `X`; `<…/code-lists/Name#X>` → `X`. `Name` need not be the class
 * itself: subset lists such as `WeightUnitCode` enumerate members of
 * `MeasurementUnitCode`.
 */
function oneOfValue(term: string): string | undefined {
  return DEFAULT_PREFIX_NAME.exec(term)?.[1] ?? CODE_LIST_MEMBER.exec(term)?.[1]
}

/** A restriction anywhere other than directly under the block's `rdfs:subClassOf` is not understood. */
function rejectRestrictions(block: ClassBlock, nodes: readonly Node[]): void {
  for (const node of nodes) {
    if (isRestriction(node)) {
      block.restrictionErrors.push(
        `the owl:Restriction at L${node.line} is not a direct rdfs:subClassOf object`,
      )
    }
    const children =
      node.kind === 'bnode'
        ? node.pairs.map((pair) => pair.object)
        : node.kind === 'list'
          ? node.items
          : []
    rejectRestrictions(block, children)
  }
}

// ---------------------------------------------------------------------------
// Parsing one class block: subject predicateObjectList '.'

interface Pair {
  predicate: string
  object: Node
}

interface BnodeNode {
  kind: 'bnode'
  pairs: Pair[]
  line: number
}

type Node =
  | { kind: 'term'; value: string; line: number }
  | { kind: 'literal'; lexical: string; line: number }
  | { kind: 'list'; items: Node[]; line: number }
  | BnodeNode

class BlockParser {
  private position = 0

  constructor(
    private readonly tokens: readonly Token[],
    private readonly className: string,
  ) {}

  parseStatement(): Pair[] {
    this.expectTerm()
    const pairs = this.parsePredicateObjectList()
    this.expectPunct('.')
    const extra = this.tokens[this.position]
    if (extra !== undefined) this.fail(extra, 'tokens after the closing .')
    return pairs
  }

  private parsePredicateObjectList(): Pair[] {
    const pairs: Pair[] = []
    let more = true
    while (more) {
      const predicate = this.expectTerm()
      pairs.push({ predicate, object: this.parseObject() })
      while (this.takePunct(',')) pairs.push({ predicate, object: this.parseObject() })
      // Turtle allows repeated and trailing ';'.
      let separated = false
      while (this.takePunct(';')) separated = true
      const next = this.tokens[this.position]
      more = separated && !(next?.type === 'punct' && (next.value === ']' || next.value === '.'))
    }
    return pairs
  }

  private parseObject(): Node {
    const token = this.next()
    const { line } = token
    if (token.type === 'term') return { kind: 'term', value: token.value, line }
    if (token.type === 'literal') return { kind: 'literal', lexical: token.lexical, line }
    if (token.value === '[') {
      const pairs = this.takePunct(']') ? [] : this.parsePredicateObjectList()
      if (pairs.length > 0) this.expectPunct(']')
      return { kind: 'bnode', pairs, line }
    }
    if (token.value === '(') {
      const items: Node[] = []
      while (!this.takePunct(')')) items.push(this.parseObject())
      return { kind: 'list', items, line }
    }
    return this.fail(token, 'expected an object')
  }

  private expectTerm(): string {
    const token = this.next()
    if (token.type !== 'term') return this.fail(token, 'expected a name')
    return token.value
  }

  private expectPunct(value: Punct): void {
    const token = this.next()
    if (token.type !== 'punct' || token.value !== value) this.fail(token, `expected ${value}`)
  }

  private takePunct(value: Punct): boolean {
    const token = this.tokens[this.position]
    if (token?.type !== 'punct' || token.value !== value) return false
    this.position++
    return true
  }

  private peek(): Token {
    const token = this.tokens[this.position]
    if (token === undefined) return this.failAtEnd()
    return token
  }

  private next(): Token {
    const token = this.peek()
    this.position++
    return token
  }

  private fail(token: Token, message: string): never {
    throw new Error(`ontology-extract: ${this.className}: ${message} at L${token.line}`)
  }

  private failAtEnd(): never {
    throw new Error(`ontology-extract: ${this.className}: unexpected end of class block`)
  }
}

// ---------------------------------------------------------------------------
// Lexing: one line at a time, carrying multi-line """…""" literals across lines

type Punct = '[' | ']' | '(' | ')' | ';' | ',' | '.'

type Token =
  | { type: 'punct'; value: Punct; line: number }
  /** A prefixed name, keyword or `<IRI>` (angle brackets kept). */
  | { type: 'term'; value: string; line: number }
  /** A string literal: its raw text between the quotes. A `^^type` or `@lang` suffix is dropped. */
  | { type: 'literal'; lexical: string; line: number }

const PUNCT: ReadonlySet<string> = new Set<Punct>(['[', ']', '(', ')', ';', ','])

/** `.` is excluded: it is lexed by the bare-term branch, which tells `:a.b` from a final `.`. */
function isPunct(c: string): c is Punct {
  return PUNCT.has(c)
}

/** A bare term never ends in `.`: a trailing `.` terminates the statement. */
const BARE_TERM = /[^\s[\]();,"<#]*[^\s[\]();,"<#.]/y
const LITERAL_SUFFIX =
  /\^\^(?:<[^>]*>|[^\s[\]();,"<#]*[^\s[\]();,"<#.])|@[A-Za-z]+(?:-[A-Za-z0-9]+)*/y

class LineLexer {
  private longString: { line: number; parts: string[] } | null = null

  /** True while inside a multi-line `"""…"""` literal. */
  get inString(): boolean {
    return this.longString !== null
  }

  lex(text: string, line: number): Token[] {
    const tokens: Token[] = []
    let i = 0
    if (this.longString !== null) {
      const end = findClosing(text, 0, '"""')
      if (end === -1) {
        this.longString.parts.push(text)
        return tokens
      }
      const { line: start, parts } = this.longString
      this.longString = null
      i = pushLiteral(tokens, [...parts, text.slice(0, end)].join('\n'), start, text, end + 3)
    }
    while (i < text.length) {
      const c = text.charAt(i)
      if (/\s/.test(c)) {
        i++
      } else if (c === '#') {
        break
      } else if (isPunct(c)) {
        tokens.push({ type: 'punct', value: c, line })
        i++
      } else if (text.startsWith('"""', i)) {
        const end = findClosing(text, i + 3, '"""')
        if (end === -1) {
          this.longString = { line, parts: [text.slice(i + 3)] }
          break
        }
        i = pushLiteral(tokens, text.slice(i + 3, end), line, text, end + 3)
      } else if (c === '"') {
        const end = findClosing(text, i + 1, '"')
        if (end === -1) throw new Error(`ontology-extract: unterminated string literal at L${line}`)
        i = pushLiteral(tokens, text.slice(i + 1, end), line, text, end + 1)
      } else if (c === '<') {
        const end = text.indexOf('>', i)
        if (end === -1) throw new Error(`ontology-extract: unterminated <IRI> at L${line}`)
        tokens.push({ type: 'term', value: text.slice(i, end + 1), line })
        i = end + 1
      } else {
        BARE_TERM.lastIndex = i
        const term = BARE_TERM.exec(text)?.[0]
        if (term !== undefined) {
          tokens.push({ type: 'term', value: term, line })
          i += term.length
        } else {
          // Only a run of '.' reaches here: each one terminates a statement.
          tokens.push({ type: 'punct', value: '.', line })
          i++
        }
      }
    }
    return tokens
  }
}

/** Index of the first unescaped `quote` at or after `from`, or -1. */
function findClosing(text: string, from: number, quote: '"' | '"""'): number {
  for (let i = from; i < text.length; i++) {
    if (text.charAt(i) === '\\') i++
    else if (text.startsWith(quote, i)) return i
  }
  return -1
}

/** Pushes a literal token and skips its optional `^^type` / `@lang` suffix. */
function pushLiteral(
  tokens: Token[],
  lexical: string,
  line: number,
  text: string,
  after: number,
): number {
  tokens.push({ type: 'literal', lexical, line })
  LITERAL_SUFFIX.lastIndex = after
  return after + (LITERAL_SUFFIX.exec(text)?.[0].length ?? 0)
}
