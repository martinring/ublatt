#!/usr/bin/env node

// src/cli/ublatt.ts
import "source-map-support/register.js";
import {
  argv,
  stdin
} from "process";
import yargs from "yargs";

// src/cli/build.ts
import {
  readFileSync as readFileSync2,
  writeFileSync
} from "fs";
import {
  parse as parse3
} from "path";

// src/cli/metadata.ts
import yaml from "yaml";
import {
  readFile
} from "fs/promises";
function parseMetadata(input) {
  return yaml.parse(input);
}
function mergeMetadata(from, to) {
  Object.keys(from).forEach((key) => {
    to[key] = from[key];
  });
  return to;
}
function extractMetadata(input, meta) {
  const lines = input.split("\n");
  var start = null;
  var blank = true;
  var i = 0;
  var buf = "";
  while (i < lines.length) {
    if (typeof start == "number") {
      if (lines[i].match(/^(---|...)\s*$/)) {
        try {
          const x = parseMetadata(buf);
          Object.keys(x).forEach((key) => {
            meta[key] = x[key];
          });
          lines.splice(start, i - start + 1);
        } catch (e) {
          console.warn(e);
          i = i - (i - start + 1);
        }
        start = null;
        blank = false;
        buf = "";
      } else {
        buf += lines[i] + "\n";
      }
    } else {
      if (blank && lines[i].match(/^---\s*$/)) {
        start = i;
      } else if (lines[i].match(/^\s*$/)) {
        blank = true;
      } else {
        blank = false;
      }
    }
    i += 1;
  }
  return lines.join("\n");
}

// src/cli/modules.ts
import {existsSync, lstatSync, readdirSync} from "fs";
import {parse} from "path";
function extractModules(base) {
  let result = new Map();
  if (existsSync(base) && lstatSync(base).isDirectory) {
    readdirSync(base).forEach((file) => {
      const p = parse(file);
      if (p.ext == ".ts" || p.ext == ".tsx") {
        let submodules = extractModules(`${base}/${p.name}`);
        result.set(p.name, submodules);
      }
    });
  }
  return result;
}

// src/cli/markdown.ts
import markdownit from "markdown-it";
import container from "markdown-it-container";
import texmath from "markdown-it-texmath";
import katex from "katex";
import bspans from "markdown-it-bracketed-spans";
import attrs from "markdown-it-attrs";
import secs from "markdown-it-header-sections";
import {
  existsSync as existsSync2,
  readFileSync
} from "fs";
import {
  parse as parse2
} from "path";
var Markdown = class {
  constructor(options) {
    this.md = markdownit().use(container, "classes", {
      validate(params) {
        return params.trim().match(/^(\w+\s+)*\w+$/);
      },
      render(tokens, idx) {
        const classes = tokens[idx].info.trim().split(/\s+/);
        options.processClasses?.(classes);
        if (tokens[idx].nesting === 1) {
          return `<div class="${classes.join(" ")}">
`;
        } else {
          return "</div>\n";
        }
      }
    }).use(texmath, {engine: katex, delimiters: "dollars"}).use(bspans).use(attrs).use(secs);
    if (options.processClasses) {
      const processClasses = options.processClasses;
      const renderAttrs = this.md.renderer.renderAttrs;
      this.md.renderer.renderAttrs = function(tkn) {
        if (tkn.attrs) {
          const c = tkn.attrs.find((x) => x && x[0] == "class");
          if (c) {
            const classes = c[1].split(/\s+/);
            processClasses(classes);
          }
        }
        return renderAttrs(tkn);
      };
    }
    this.md.renderer.rules.image = function(tokens, idx, opts, env, slf) {
      const token = tokens[idx];
      let src = token.attrGet("src");
      if (src && existsSync2(options.dir + "/" + src)) {
        const mime = "image/" + parse2(src).ext.slice(1);
        const uri = `data:${mime};base64,${readFileSync(options.dir + "/" + src).toString("base64")}`;
        token.attrSet("src", uri);
      } else {
        console.warn(src + " does not exist");
      }
      return slf.renderToken(tokens, idx, opts);
    };
    this.md.renderer.rules.fence = function(tokens, idx, options2, env, slf) {
      const token = tokens[idx];
      token.attrJoin("class", token.info);
      return "<pre" + slf.renderAttrs(token) + "><code>" + token.content + "</code></pre>";
    };
  }
  render(input) {
    return this.md.render(input);
  }
};
var markdown_default = Markdown;

// src/cli/build.ts
import esbuild from "esbuild";
import {readFile as readFile2} from "fs/promises";

// externals.json
var externals_default = {};

// package.json
var name = "ublatt";
var files = [
  "*",
  "dist/*"
];
var main = "dist/ublatt.js";
var version = "1.4.0";
var description = "An interactive exercise sheet generator";
var homepage = "https://github.com/martinring/ublatt";
var license = "MIT";
var bugs = "https://github.com/martinring/ublatt/issues";
var scripts = {
  build: "./build.js",
  clean: "rm -rf dist"
};
var author = "Martin Ring <martin.ring@dfki.de> (https://www.martinring.de)";
var repository = "github:martinring/ublatt";
var type = "module";
var bin = {
  ublatt: "node --enable-source-maps bin/ublatt.js"
};
var os = [
  "darwin",
  "linux"
];
var dependencies = {
  "@codemirror/commands": "^0.17.0",
  "@codemirror/gutter": "^0.17.0",
  "@codemirror/highlight": "^0.17.0",
  "@codemirror/history": "^0.17.0",
  "@codemirror/language": "^0.17.0",
  "@codemirror/legacy-modes": "^0.17.0",
  "@codemirror/state": "^0.17.0",
  "@codemirror/view": "^0.17.0",
  esbuild: "^0.8.31",
  katex: "^0.12.0",
  "lezer-generator": "^0.13.2",
  "markdown-it": "^12.0.4",
  "markdown-it-attrs": "^4.0.0",
  "markdown-it-bracketed-spans": "^1.0.1",
  "markdown-it-container": "^3.0.0",
  "markdown-it-header-sections": "^1.0.0",
  "markdown-it-texmath": "0.8.0",
  mermaid: "8.9.0",
  prismjs: "1.21.0",
  punycode: "^2.1.1",
  yaml: "^1.10.0",
  yargs: "^16.2.0",
  "source-map-support": "^0.5.19"
};
var devDependencies = {
  "@types/babel__core": "^7.1.12",
  "@types/katex": "^0.11.0",
  "@types/markdown-it": "^12.0.1",
  "@types/markdown-it-container": "^2.0.3",
  "@types/mermaid": "8.2.1",
  "@types/node": "^14.14.19",
  "@types/prismjs": "1.9.0",
  "@types/yargs": "^16.0.0",
  tslib: "2.1.0",
  typescript: "^4.1.3"
};
var package_default = {
  name,
  files,
  main,
  version,
  description,
  homepage,
  license,
  bugs,
  scripts,
  author,
  repository,
  type,
  bin,
  os,
  dependencies,
  devDependencies
};

// src/cli/externals.ts
var externals_default2 = {
  filter: RegExp(`^(${Object.keys(externals_default).join("|")})$`),
  path(key) {
    return externals_default[key].replace(/\$\{\s*version\s*\}/, package_default.dependencies[key]);
  }
};

// src/shared/templates/main.ts
function main_default(props) {
  return (h) => h.fragment(h.fromString("<!DOCTYPE html>"), h("html", {lang: props.lang}, h("head", {}, h("meta", {name: "generator", content: "ublatt"}), h("meta", {attributes: {charset: "utf-8"}}), h.fragment(...props.authors.map((a) => h("meta", {name: "author", content: a.name}))), h("title", {}, props.pagetitle), h("script", {type: "module"}, props.script), h("style", {}, props.style)), h("body", {}, h("form", {class: "ublatt"}, props.header, h("div", {class: "main"}, props.body), props.footer))));
}

// src/shared/templates/header.ts
function header_default(props) {
  return (h) => h("div", {class: "head"}, h.when(props.title, () => h("span", {class: "title"}, props.title)), h.when(props.subtitle, () => h("span", {class: "term"}, props.subtitle)), h("ul", {class: "lecturers"}, ...(props.authors || []).map((a) => h("li", {}, a.name))), h.when(props.sheet, () => h("span", {class: "sheetnum"}, `${props.sheet}. \xDCbungsblatt`)), h.when(props.date, () => h.fragment(h("span", {class: "issued-title"}, "Ausgabe: "), h("span", {class: "issued"}, props.date))), h.when(props.due, () => h.fragment(h("span", {class: "due-title"}, "Abgabe: "), h("span", {class: "due"}, props.due))));
}

// src/shared/templates/submit.ts
function submit_default(props) {
  return (\u00B5) => \u00B5("div", {class: "submit"}, \u00B5("div", {}, \u00B5("h1", {}, "Abgabe"), \u00B5("p", {}, "Bitte gebt alle Autoren mit Matrikelnummer und Emailaddresse an und speichert dann eure L\xF6sung. Die gespeicherte JSON Datei sendet ihr dann an beide Tutoren per E-Mail."), \u00B5("div", {class: "buttons", id: props.buttons})), \u00B5("div", {}, \u00B5("h1", {}, "Autoren"), \u00B5("div", {class: "authors"})));
}

// src/cli/render.ts
var voidTags = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);
var renderer = Object.assign(function(k, props, ...children) {
  const attrs2 = Object.entries(props).map(([k2, v]) => {
    switch (k2) {
      case "attributes":
        return Object.entries(v).map(([k3, v2]) => `${k3}="${v2}"`).join(" ");
      case "data":
        return Object.entries(v).map(([k3, v2]) => `data-${k3}="${v2}"`).join(" ");
      case "class":
        return `class="${Array.isArray(v) ? v.join(" ") : v}"`;
      default:
        return `${k2.toLowerCase()}="${v}"`;
    }
  }).join(" ");
  if (children.length == 0 && voidTags.has(k)) {
    return `<${k} ${attrs2}/>`;
  } else {
    return `<${k} ${attrs2}>
${children.join("")}
</${k}>`;
  }
}, {
  fragment(...items) {
    return items.join("");
  },
  fromString(v) {
    return v;
  },
  empty() {
    return "";
  },
  when(p, t) {
    return p ? t() : "";
  }
});
function render(template) {
  return template(renderer);
}

// src/cli/build.ts
import {buildParserFile} from "lezer-generator";
async function build(options) {
  const dir = options.source == "stdin" ? "." : parse3(options.source).dir;
  const f = readFileSync2(options.source == "stdin" ? 0 : options.source).toString("utf-8");
  const modules = extractModules(options.dataDir + "/src/runtime/modules");
  const meta = {
    lang: Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0],
    eval: options.submission || options.solution ? true : void 0
  };
  if (options.meta) {
    options.meta.forEach((x) => {
      const src = readFileSync2(x).toString("utf-8");
      const m = parseMetadata(src);
      mergeMetadata(m, meta);
    });
  }
  const markdown = extractMetadata(f, meta);
  meta.author = meta.author || [];
  var pagetitle = "";
  if (meta["sheet"] !== void 0)
    pagetitle += meta["sheet"].toString() + (meta.i18n?.["sheet-title"] || ". \xDCbungsblatt") + " - ";
  pagetitle += meta["title"] || "ublatt";
  if (meta["subtitle"])
    pagetitle += " - " + meta["subtitle"];
  if (options.submission) {
    meta["authors"] = options.submission.authors;
  }
  const imports = [
    "import Ublatt from './src/runtime/ublatt'"
  ];
  const imported = new Set();
  const inits = [
    `const meta = ${JSON.stringify(meta)}`,
    `const ublatt = new Ublatt(document.querySelector('form.ublatt'),meta)`,
    `window.ublatt = ublatt`
  ];
  function findModules(base, modules2, classes, parent) {
    if (modules2.size > 0) {
      classes.forEach((c) => {
        const submodules = modules2.get(c);
        if (submodules) {
          const path4 = `${base}/${c}`;
          if (!imported.has(path4)) {
            imported.add(path4);
            imports.push(`import ${c.charAt(0).toUpperCase() + c.slice(1)} from '${path4}'`);
            inits.push(`const ${c} = new ${c.charAt(0).toUpperCase() + c.slice(1)}()`);
            inits.push(`${parent}.registerModule('${c}',${c})`);
          }
          findModules(base + "/" + c, submodules, classes, c);
        }
      });
    }
  }
  const md = new markdown_default({
    dir,
    processClasses(x) {
      return findModules("./src/runtime/modules", modules, x, "ublatt");
    },
    standalone: options.standalone
  });
  const body = md.render(markdown);
  const initArgs = [];
  if (options.submission) {
    const sub = options.submission;
    meta["author"] = sub.authors.map((a) => a.name);
    initArgs.push(JSON.stringify(sub));
  }
  if (options.solution) {
    let solution = options.solution;
    initArgs.push(JSON.stringify(solution));
  }
  inits.push(`ublatt.init(${initArgs.join(", ")})`);
  let script = imports.join(";\n") + ";" + inits.join(";\n");
  let style = "";
  const bundle = await esbuild.build({
    stdin: {
      contents: script,
      resolveDir: options.dataDir,
      sourcefile: "init.ts"
    },
    bundle: true,
    platform: "browser",
    format: "esm",
    outdir: options.dataDir + "/dist",
    write: false,
    target: "es2018",
    charset: "utf8",
    color: true,
    sourcemap: options.debug ? "inline" : false,
    sourcesContent: options.debug,
    loader: {
      ".woff": "dataurl",
      ".svg": "dataurl"
    },
    plugins: [
      {
        name: "externals",
        setup(build2) {
          build2.onResolve({filter: externals_default2.filter}, (args) => {
            return {
              external: true,
              path: externals_default2.path(args.path)
            };
          });
        }
      },
      {
        name: "lezer",
        setup(build2) {
          build2.onLoad({filter: /\.grammar$/}, async (args) => {
            const source = await readFile2(args.path, {encoding: "utf-8"});
            const {parser} = buildParserFile(source, {});
            return {
              contents: parser,
              loader: "js"
            };
          });
        }
      }
    ],
    minify: !options.debug
  });
  bundle.warnings?.forEach(console.warn);
  if (bundle.outputFiles) {
    script = bundle.outputFiles[0].text.replaceAll("</script>", "<\\/script>");
    style = bundle.outputFiles[1].text;
  }
  meta["$dir"] = "dist";
  const footer = render((\u00B5) => \u00B5.when(!options.submission, () => submit_default({buttons: "submit-buttons"})(\u00B5)));
  meta.authors = meta.authors || meta.author.map((x) => ({name: x}));
  const output = render(main_default({
    lang: meta.lang,
    authors: meta.authors || [],
    pagetitle,
    header: render(header_default(meta)),
    body,
    script,
    style,
    footer
  }));
  if (options.out == "stdout") {
    process.stdout.write(output);
  } else {
    writeFileSync(options.out, output);
  }
}

// src/cli/summary.ts
import {
  readFileSync as readFileSync3,
  readdirSync as readdirSync2
} from "fs";
import {
  parse as parse4
} from "path";
function summary(options) {
  let course = null;
  const sheets = {};
  const students = {};
  const handins = {};
  readdirSync2(options.dir).filter((x) => parse4(x).ext == ".json").map((x) => {
    const src = readFileSync3(options.dir + x).toString("utf-8");
    const obj = JSON.parse(src);
    if (course == null) {
      course = obj.course;
    } else if (course != obj.course) {
      console.error(`- found submissions to multiple courses (${course} and ${obj.course})`);
    }
    obj.authors.forEach((a) => {
      students[a.matriculation_number] = students[a.matriculation_number] || a;
      if (!handins[a.matriculation_number])
        handins[a.matriculation_number] = {};
      if (handins[a.matriculation_number][obj.sheet])
        console.warn(`- multiple submissions for sheet ${obj.sheet} from ${a.name} (${a.matriculation_number})`);
      else
        handins[a.matriculation_number][obj.sheet] = obj;
    });
    if (!sheets[obj.sheet])
      sheets[obj.sheet] = [];
    sheets[obj.sheet].push(obj);
  });
  console.log("## Sheets\n");
  Object.entries(sheets).forEach(([x, y]) => {
    console.log(`- sheet ${x}: ${y.length} handins from ${y.map((x2) => x2.authors.length).reduce((x2, y2) => x2 + y2)} students`);
  });
  console.log("\n## Missing handins\n");
  Object.entries(students).forEach(([x, y]) => {
    const e = handins[y.matriculation_number];
    const missing = Object.keys(sheets).filter((x2) => e[x2] === void 0);
    if (missing.length > 0)
      console.log(`- ${y.name} (${x}): ${missing.join(", ")}`);
  });
  console.log("\n");
}

// src/cli/ublatt.ts
import {dirname} from "path";
import {fileURLToPath} from "url";

// src/cli/evaluate.ts
import {
  readFileSync as readFileSync4,
  readdirSync as readdirSync3,
  statSync
} from "fs";
function evaluate(options) {
  function makeBuildOptions(s) {
    const opts = Object.assign({}, options);
    const y = readdirSync3("./solutions").filter((x) => x.endsWith(".json")).map((x) => JSON.parse(readFileSync4("./solutions/" + x).toString("utf-8"))).find((x) => x.sheet == s.sheet);
    const z = readdirSync3("./sheets").filter((x) => x.endsWith(".md")).map((x) => "./sheets/" + x).find((x) => {
      const meta = {};
      extractMetadata(readFileSync4(x).toString("utf-8"), meta);
      return meta.sheet == s.sheet;
    });
    opts.submission = s;
    opts.solution = y;
    if (!z)
      throw new Error("could not find sheet");
    opts.source = z;
    return opts;
  }
  if (statSync(options.file).isDirectory()) {
    const counters = {};
    const xs = readdirSync3(options.file).filter((x) => x.endsWith(".json")).forEach((x) => {
      const c = readFileSync4(options.file + "/" + x).toString("utf-8");
      const s = JSON.parse(c);
      const opts = makeBuildOptions(s);
      const n = counters[s.sheet] = counters[s.sheet] + 1 || 1;
      opts.out = `${options.file}/sheet${s.sheet}-${n}.html`;
      build(opts);
    });
  } else {
    const x = readFileSync4(options.file).toString("utf-8");
    const s = JSON.parse(x);
    build(makeBuildOptions(s));
  }
}

// src/cli/ublatt.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(dirname(__filename));
yargs(argv.slice(2)).scriptName("ublatt").options({
  meta: {
    type: "array",
    description: "path to meta yaml file",
    default: [],
    global: true
  },
  debug: {
    type: "boolean",
    description: "include original sources for debugging",
    default: false,
    global: true
  }
}).command("build [source]", "generate interactive exercise sheets", (argv2) => {
  return argv2.options({
    out: {
      alias: "o",
      type: "string",
      description: "file to write to",
      default: "stdout"
    },
    standalone: {
      type: "boolean",
      default: false
    },
    dataDir: {
      type: "string",
      default: __dirname,
      hidden: true
    }
  }).positional("source", {
    type: "string",
    default: "stdin"
  }).check((args) => {
    if (args.source == "stdin" && stdin.isTTY) {
      throw new Error("nothing to read from stdin");
    } else
      return true;
  });
}, build).command("summary [dir]", "analyse a directory of handins", (argv2) => argv2.options({
  dir: {
    type: "string",
    default: "."
  }
}), summary).command("evaluate file", "evaluate a solution", (argv2) => argv2.options({
  out: {
    alias: "o",
    type: "string",
    description: "file to write to",
    default: "stdout"
  },
  file: {
    type: "string",
    required: true
  },
  dataDir: {
    type: "string",
    default: __dirname,
    hidden: true
  }
}), evaluate).demandCommand().help().argv;
//# sourceMappingURL=ublatt.js.map
