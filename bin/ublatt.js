#!/usr/bin/env node

// src/cli/ublatt.ts
import {
  argv,
  stdin
} from "process";
import yargs from "yargs";

// src/cli/build.ts
import {
  existsSync as existsSync3,
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
      if (p.ext == ".js" || p.ext == ".ts" || p.ext == ".tsx") {
        let submodules = extractModules(`${base}/${p.name}`);
        result.set(p.name, {
          submodules,
          css: existsSync(`${base}/${p.name}.css`)
        });
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
import {transformAsync} from "@babel/core";
import solid from "babel-preset-solid";
import ts from "@babel/preset-typescript";
import handlebars from "handlebars";
import {readFile as readFile2} from "fs/promises";
import {parse as parse4} from "path";
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
  meta["$css"] = ["./src/runtime/ublatt.css"];
  function findModules(base, modules2, classes, parent) {
    if (modules2.size > 0) {
      classes.forEach((c) => {
        const module = modules2.get(c);
        if (module) {
          if (!imported.has(module)) {
            imported.add(module);
            imports.push(`import ${c.charAt(0).toUpperCase() + c.slice(1)} from '${base}/${c}'`);
            inits.push(`const ${c} = new ${c.charAt(0).toUpperCase() + c.slice(1)}()`);
            inits.push(`${parent}.registerModule('${c}',${c})`);
            if (module.css) {
              meta["$css"].push(base + "/" + c + ".css");
            }
          }
          findModules(base + "/" + c, module.submodules, classes, c);
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
  meta["$body"] = md.render(markdown);
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
  const script = imports.join("; ") + ";" + inits.join("; ");
  const bundle = await esbuild.build({
    stdin: {
      contents: script,
      resolveDir: options.dataDir
    },
    bundle: true,
    platform: "browser",
    format: "esm",
    write: false,
    plugins: [
      {
        name: "solid",
        setup(build2) {
          build2.onLoad({filter: /\.(t|j)sx$/}, async (args) => {
            const source = await readFile2(args.path, {encoding: "utf8"});
            const {name, ext} = parse4(args.path);
            const filename = name + ext;
            const res = await transformAsync(source, {
              presets: [solid, ts],
              filename,
              sourceMaps: "inline"
            });
            return {contents: res?.code || void 0, loader: "js"};
          });
        }
      }
    ],
    minify: true
  });
  bundle.warnings?.forEach(console.warn);
  if (bundle.outputFiles) {
    meta["$script"] = bundle.outputFiles[0].text.replaceAll("</script>", "<\\/script>");
  }
  meta["$css"] = meta["$css"].map((x) => {
    let alt = x.replace("./src/runtime", "./dist");
    if (existsSync3(options.dataDir + "/" + alt))
      x = alt;
    if (options.standalone) {
      const p = options.dataDir + "/" + x;
      let css = readFileSync2(p).toString("utf-8");
      css = css.replaceAll(/url\(['"]?([a-zA-Z\.\/0-9_@-]+)['"]?\)/g, (x2, y) => {
        const data = readFileSync2(parse3(p).dir + "/" + y).toString("base64");
        let mime;
        switch (parse3(y).ext) {
          case ".woff":
            mime = "font/woff";
            break;
          case ".png":
            mime = "image/png";
            break;
          case ".jpg":
            mime = "image/jpg";
            break;
          case ".svg":
            mime = "image/svg+xml";
            break;
          default:
            mime = "text/plain";
            break;
        }
        return `url(data:${mime};base64,${data})`;
      });
      return `<style>
${css}
</style>`;
    } else
      return `<link rel="stylesheet" href="${x}"/>`;
  });
  meta["$dir"] = "dist";
  var pagetitle = "";
  if (meta["sheet"] !== void 0)
    pagetitle += meta["sheet"].toString() + (meta.i18n?.["sheet-title"] || ". \xDCbungsblatt") + " - ";
  pagetitle += meta["title"] || "ublatt";
  if (meta["subtitle"])
    pagetitle += " - " + meta["subtitle"];
  meta["$pagetitle"] = pagetitle;
  const footerTemplateSrc = readFileSync2(options.dataDir + "/templates/submit.html").toString("utf-8");
  const footerTemplate = handlebars.compile(footerTemplateSrc);
  if (!options.submission)
    meta["$footer"] = footerTemplate(meta);
  const templateSrc = readFileSync2(options.dataDir + "/templates/ublatt.html").toString("utf-8");
  const template = handlebars.compile(templateSrc);
  if (options.out == "stdout") {
    process.stdout.write(template(meta));
  } else {
    writeFileSync(options.out, template(meta));
  }
}

// src/cli/summary.ts
import {
  readFileSync as readFileSync3,
  readdirSync as readdirSync2
} from "fs";
import {
  parse as parse5
} from "path";
function summary(options) {
  let course = null;
  const sheets = {};
  const students = {};
  const handins = {};
  readdirSync2(options.dir).filter((x) => parse5(x).ext == ".json").map((x) => {
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
    const y = readdirSync3("./solutions").map((x) => JSON.parse(readFileSync4("./solutions/" + x).toString("utf-8"))).find((x) => x.sheet == s.sheet);
    const z = readdirSync3("./sheets").map((x) => "./sheets/" + x).find((x) => {
      const meta = {};
      extractMetadata(readFileSync4(x).toString("utf-8"), meta);
      return meta.sheet == s.sheet;
    });
    options.submission = s;
    options.solution = y;
    if (!z)
      throw new Error("could not find sheet");
    options.source = z;
    return options;
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
