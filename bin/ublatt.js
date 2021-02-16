#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module) => () => {
  if (!module) {
    module = {exports: {}};
    callback(module.exports, module);
  }
  return module.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name2 in all)
    __defProp(target, name2, {get: all[name2], enumerable: true});
};
var __exportStar = (target, module, desc) => {
  __markAsModule(target);
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module) => {
  if (module && module.__esModule)
    return module;
  return __exportStar(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", {value: module, enumerable: true}), module);
};

// src/shared/languages/ocl.ts
import {LezerLanguage} from "@codemirror/language";
import {styleTags, tags as t} from "@codemirror/highlight";
var require_ocl = __commonJS((exports) => {
  __export(exports, {
    default: () => ocl_default
  });
  var ocl_default = LezerLanguage.define({
    parser: parser.configure({
      props: [styleTags({
        self: t.self,
        "if then else endif": t.controlKeyword,
        "package endpackage": t.keyword,
        "true false null invalid let in context inv pre post init derive": t.keyword,
        "and or implies xor": t.keyword,
        "Set Bag Sequence Collection OrderedSet Tuple": t.typeName,
        "OclAny OclInvalid OclMessage OclVoid": t.typeName,
        "Boolean Integer Real String UnlimitedNatural": t.typeName,
        PreMarker: t.special(t.keyword),
        Type: t.typeName,
        SimpleName: t.keyword,
        BlockComment: t.blockComment,
        StringLiteral: t.string,
        NumericLiteral: t.number,
        LineComment: t.lineComment,
        EnumLiteral: t.literal,
        MethodName: t.function(t.variableName),
        PropertyName: t.propertyName,
        Namespace: t.namespace,
        VariableName: t.definition(t.variableName),
        "( )": t.paren,
        "^ ^^": t.operatorKeyword
      })]
    }),
    languageData: {}
  });
});

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
import {readFile} from "fs/promises";
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

// src/shared/codemirror/highlight.ts
import {HighlightStyle, tags} from "@codemirror/highlight";
var highlight_default = HighlightStyle.define({
  tag: tags.link,
  textDecoration: "underline"
}, {
  tag: tags.heading,
  textDecoration: "underline",
  fontWeight: "bold"
}, {
  tag: tags.function(tags.variableName),
  color: "#795e26"
}, {
  tag: tags.emphasis,
  fontStyle: "italic"
}, {
  tag: tags.strong,
  fontWeight: "bold"
}, {
  tag: tags.keyword,
  color: "#00f"
}, {
  tag: tags.controlKeyword,
  color: "#af00db"
}, {
  tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
  color: "#219"
}, {
  tag: [tags.literal, tags.inserted],
  color: "#098658"
}, {
  tag: [tags.string, tags.deleted],
  color: "#a31515"
}, {
  tag: [tags.regexp, tags.escape, tags.special(tags.string)],
  color: "#e40"
}, {
  tag: tags.definition(tags.variableName),
  color: "#0070c1"
}, {
  tag: tags.local(tags.variableName),
  color: "#30a"
}, {
  tag: [tags.typeName, tags.namespace],
  color: "#267f99"
}, {
  tag: tags.className,
  color: "#267f99"
}, {
  tag: [tags.special(tags.variableName), tags.macroName, tags.local(tags.variableName)],
  color: "#256"
}, {
  tag: tags.propertyName,
  color: "#001080"
}, {
  tag: tags.definition(tags.propertyName),
  color: "#001080"
}, {
  tag: tags.comment,
  color: "#008000"
}, {
  tag: tags.meta,
  color: "#7a757a"
}, {
  tag: tags.invalid,
  color: "#f00"
});

// src/cli/markdown.ts
import {highlightTree} from "@codemirror/highlight";

// src/shared/languages/ocl.grammar
import {Parser} from "lezer";
var spec_simpleName = {__proto__: null, package: 8, context: 14, Set: 23, Bag: 25, Sequence: 27, Collection: 29, OrderedSet: 31, Tuple: 33, pre: 48, and: 56, or: 58, xor: 60, implies: 62, self: 66, true: 92, false: 94, null: 98, invalid: 102, let: 106, in: 108, if: 118, then: 120, else: 122, endif: 124, OclAny: 127, OclInvalid: 129, OclMessage: 131, OclVoid: 133, init: 134, derive: 136, inv: 138, static: 140, def: 142, post: 146, body: 148, endpackage: 150};
var parser = Parser.deserialize({
  version: 13,
  states: ":jQ]QPOOOOQO'#ES'#ESOOQO'#Dz'#DzQ`QPOOQOQPOOOeQPO'#ExOjQPO'#EOOOQO-E7x-E7xOoQPO,5;dOOQO'#EQ'#EQO!QQPO,5;dO!`QPO,5;hOOQO'#Ca'#CaO!kQPO,5:jOjQPO1G1OO!vQPO1G0ZO!{QPO'#EyO#TQPO'#EyO#]QPO'#EyOOQO1G1O1G1OO#bQPO'#E}OOQO1G1S1G1SO#gQPO,5:lO#lQPO1G0UOOQO1G0U1G0UO#tQPO7+&jO$SQPO'#CbOOQO1G0W1G0WO$hQPO1G1RO$mQPO7+%uO$rQPO,5;eO%|QPO,5;eO&RQPO,5;eO&WQPO,5;eO&]QPO,5;eO&eQPO,5;iOOQO'#Cb'#CbOOQO7+%p7+%pOOQO<<JU<<JUO&jQPO7+&mO'gQPO<<IaO)UQPO'#CaO*bQPO'#DPO+zQPO1G1POOQO'#Cq'#CqOOQO'#Cp'#CpO,XQPO'#DROOQO'#DX'#DXOOQO'#DW'#DWOOQO'#DO'#DOOOQO'#Co'#CoOOQO'#EX'#EXOOQO'#C|'#C|O,^QPO'#DVOOQO'#DZ'#DZOOQO'#D^'#D^OOQO'#D`'#D`O,cQPO'#DbO$rQPO'#DhO$rQPO1G1PO,hQPO'#CaO-VQPO'#E{O-[QPO'#CmOOQO'#Ez'#EzO.VQPO'#EzO.[QPO1G1PO&RQPO1G1PO.pQPO1G1PO$rQPO1G1TOOQO'#Cn'#CnO.uQPO'#E]O/TQPO<<JXO/YQPO<<JXO/_QPO'#CaO0iQPO'#EVO0nQPO'#EWOOQO'#EV'#EVO0sQPO'#E[OOQO'#Ev'#EvO0xQPOAN>{O1QQPO,5:lO1VQPO,59aO$rQPO,59cO$rQPO,59cO$rQPO,59cO$rQPO,59cO1[QPO,5:PO$rQPO,59cO$rQPO,59cO$rQPO,59cOOQO7+&k7+&kO$rQPO,59mO,cQPO,59qO1aQPO,59|O2pQPO,5:SO2wQPO7+&kO3UQPO,5:lO$rQPO,59XO3ZQPO,59XO$rQPO,5;fO4TQPO7+&kO&RQPO7+&kO4iQPO7+&oO,cQPO,5:wO5PQPOAN?sO5mQPOAN?sO5rQPO,5:lO5wQPO,5:rO,cQPO,5:vO6OQPO'#EwOOQOG24gG24gO6TQPO'#CbOOQO1G/V1G/VO8pQPO'#CsO;`QPO1G.xOOQO1G.{1G.{O=wQPO1G.}O>RQPO1G.}O@iQPO1G.}O@yQPO1G.}OAZQPO1G/kOCuQPO1G.}OC|QPO1G.}OEXQPO1G.}OFqQPO'#DTOOQO'#DT'#DTOGOQPO'#DSOGWQPO1G/XOG]QPO1G/]O$rQPO1G/hO$rQPO1G/nOOQO<<JV<<JVOGbQPO'#CbOGjQPO1G.sOHaQPO1G.sOIXQPO1G1QOIoQPO<<JVOOQO<<JZ<<JZOOQO1G0c1G0cOOQOG25_G25_OJTQPOG25_OJqQPO'#CbOOQO1G0]1G0]OK{QPO1G0^OLQQPO1G0bO$rQPO,5;cOLVQPO,59_OMcQPO7+$dOMmQPO7+%VO$rQPO,59pO$rQPO,59nOOQO7+$s7+$sOOQO7+$w7+$wOMtQPO7+%SO! ^QPO7+%YO$rQPO7+$_OOQOAN?qAN?qOOQOLD*yLD*yOOQO7+%x7+%xOOQO7+%|7+%|O! eQPO1G0}O! xQPO1G.yO!$eQPO'#CaO!$uQPO'#EdOOQO<<HO<<HOO!%PQPO<<HOO!%UQPO<<HOO!%^QPO'#DgO!%hQPO'#DgO!%sQPO'#DfO!%{QPO<<HqO!&QQPO1G/[OOQO1G/Y1G/YO$rQPO<<HtO!&[QPO<<GyOOQO7+&i7+&iO$rQPO,5;OOOQOAN=jAN=jO!'RQPOAN=jO,cQPOAN=jO!'YQPO,5:ROMmQPO,5:QOOQOAN>]AN>]O!'dQPOAN>`OOQO1G0j1G0jOOQOG23UG23UO!'kQPOG23UO!'pQPOG23UOOQO1G/m1G/mOOQO1G/l1G/lOOQOG23zG23zOOQOLD(pLD(pO!'uQPOLD(pOOQO!$'L[!$'L[O!'|QPO!$'L[OOQO!)9Av!)9Av",
  stateData: "!(R~O!qOSPOSQOS~OSUOVTO~O!sWO~O!s[O~O!x^O!gTX!hTX!iTX!uTX~O!g`O!hbO!iaO!u_O~OhdO!kdO!ldO~OVTO!mhO!ufO~O!sjO~O!soO!xnO~O!sqO!xpO~O!irO~O!ssO~O!stO~OVTO!muO~O!g`O!hbO!iaO!ufO~O!gUX!hUX!iUX!uUX!xWX!|!jX~O!|wO~O!xxO~OZ!TO[!TO]!TO^!TO_!TO`!VOq!UO|!QO!O!WO!P!WO!R!XO!T!YO!V!ZO!]![O!syO#X!PO#e!PO#f!PO~O!x!]O~O!s!^O~O!x!dO~O!s!eO!x!dO~O!x!fO~O!s!gO!}!iO~OZ!TO[!TO]!TO^!TO_!TO`!oO!a!pO!b!pO!c!pO!d!pO!s!kO~O!e!yP!f!yP~P&rOlpXmpXnpXopX!uTX#QpX#RpX#SpX#XpX#YpX#ZpX#[pX#]pX#^pX#_pX#`pX#apX#gpX#hpX#UpX!}pX~OVpX!gpX!hpX!ipX!opX!^pXhpX!kpX!lpX#cpX#dpX!mpX!WpX!_pX!epX!fpX!`pX#VpX~P'qO!u!rO~Ol!yOm!zOn!zOo!{O!g`O!hbO!iaO#Q!wO#R!sO#S!sO#X!tO#Y!tO#Z!uO#[!uO#]!vO#^!vO#_!vO#`!vO#a!wO#g!xO#h!xO~OV#mi!o#mi!m#mi~P*gO#b!}O~O#b#OO~O!s!gO~OVbX!gbX!hbX!ibX!obX!uTX!xbX#QbX!mbX~O!u#SO~O!x#UO#Q#TOVaX!gaX!haX!iaX!oaX!}aX#UaX!WaX#daX!maX#VaX~O#Q#VO~O!g`O!hbO!iaOV#mi!o#mi!m#mi~O!x#XO~O#U#ZO!}#PX!W#PX#d#PX~O!x#[O~O!}#]O~O!eYX!fYX!uTXVYX!gYX!hYX!iYX!oYX#QYX!}YX#UYXhYX!kYX!lYX!WYX#dYX!mYX#VYX~O!u#^O~O!|#_O~O!|#`O~O!e#aO!f#aO~O!s#cO~O!s#eO~O!s#lO~O!W#uO~Ol!yOm!zOn!zOo!{O#Q!wO#R!sO#S!sO#X!tO#Y!tO#Z!uO#[!uO#]!vO#^!vO#_!vO#`!vO#a!wO#g!xO#h!xO~O!^#vO~P1fOV#mq!o#mq!m#mq~P*gO!s#xO~OV!yP!g!yP!h!yP!i!yP!o!yP#Q!yP!}!yP#U!yP!W!yP#d!yP!m!yP#V!yP~P&rO!g`O!hbO!iaOV#mq!o#mq!m#mq~OhdO!kdO!ldOV#qq!o#qq!m#qq~P1fOh!yPh#o!R!k!yP!k#o!R!l!yP!l#o!R#Q!yP#Q#o!R~P&rO!x$QO~O!s$RO~O!}!yP~P&rO!x$VO~OVtXltXmtXntXotX!gtX!htX!itX!otX!uUX#QtX#RtX#StX#XtX#YtX#ZtX#[tX#]tX#^tX#_tX#`tX#atX#gtX#htX!^tXhtX!ktX!ltX#UtX#ctX#dtX!mtX!}tX!WtX!_tX!etX!ftX!`tX#VtX~O#T$WOVjXljXmjXnjXojX!gjX!hjX!ijX!ojX!|gX#QjX#RjX#SjX#XjX#YjX#ZjX#[jX#]jX#^jX#_jX#`jX#ajX#gjX#hjX!^jXhjX!kjX!ljX#UjX#cjX#djX!mjX!}jX!WjX!_jX!ejX!fjX!`jX#VjX~O!|$XO~O#R!sO#S!sOVkilkimkinkioki!gki!hki!iki!oki#Qki#Zki#[ki#]ki#^ki#_ki#`ki#aki#gki#hki!^kihki!kki!lki#Uki#cki#dki!mki!}ki!Wki!_ki!eki!fki!`ki#Vki~O#Xki#Yki~P;eO#X!tO#Y!tO~P;eO#R!sO#S!sO#X!tO#Y!tO#Z!uO#[!uOVkilkimkinkioki!gki!hki!iki!oki#Qki#aki#gki#hki!^kihki!kki!lki#Uki#cki#dki!mki!}ki!Wki!_ki!eki!fki!`ki#Vki~O#]ki#^ki#_ki#`ki~P>]O#]!vO#^!vO#_!vO#`!vO~P>]O!|$YO~O#Q!wO#R!sO#S!sO#X!tO#Y!tO#Z!uO#[!uO#]!vO#^!vO#_!vO#`!vO#a!wOVkimkinkioki!gki!hki!iki!oki#gki#hki!^kihki!kki!lki#Uki#cki#dki!mki!}ki!Wki!_ki!eki!fki!`ki#Vki~Olki~PA`Ol!yO~PA`Ol!yOm!zOn!zOo!{O#Q!wO#R!sO#S!sO#X!tO#Y!tO#Z!uO#[!uO#]!vO#^!vO#_!vO#`!vO#a!wO~OVki!gki!hki!iki!oki#gki#hki!^kihki!kki!lki#Uki#cki#dki!mki!}ki!Wki!_ki!eki!fki!`ki#Vki~PDTO#c$ZO#UwX#dwX~P1fO#U$[O#dvX~O#d$]O~O#d$^O~O!uUX!|!jX~OVai!gai!hai!iai!oai!}ai#Uai!Wai#dai!mai#Vai~P1fO#Q$aOVai!gai!hai!iai!oai!}ai#Uai!Wai#dai!mai#Vai~OV#ni!g#ni!h#ni!i#ni!o#ni!m#ni~P1fO!g`O!hbO!iaOV#my!o#my!m#my~Oh!yPh#o!Z!k!yP!k#o!Z!l!yP!l#o!Z#Q!yP#Q#o!Z~P&rO!eXX!fXX!uUXVXX!gXX!hXX!iXX!oXX#QXX!}XX#UXXhXX!kXX!lXX!WXX#dXX!mXX#VXX~O!}$dO~O!}$eO~Oh$gO~OZ!TO[!TO]!TO^!TO_!TO`!VOq!UO|!QO!O!WO!P!WO!R!XO!T!YO!V!ZO!]![O#X!PO#e!PO#f!PO~O!s$hO!}$jO~PL[O#i$nO~P$rOV!Uq!g!Uq!h!Uq!i!Uq!o!Uq#g!Uq#h!Uq!^!Uqh!Uq!k!Uq!l!Uq#U!Uq#c!Uq#d!Uq!m!Uq!}!Uq!W!Uq!_!Uq!e!Uq!f!Uq!`!Uq#V!Uq~PDTO!_$sO~P1fO!e#aO!f#aOV#ki!o#ki!m#ki~P1fOVjiljimjinjioji!gji!hji!iji!oji!|gi#Qji#Rji#Sji#Xji#Yji#Zji#[ji#]ji#^ji#_ji#`ji#aji#gji#hji!^jihji!kji!lji#Uji#cji#dji!mji!}ji!Wji!_ji!eji!fji!`ji#Vji~O!xbX#QbX#UbX#VbX~P'qO#U$vO!}#WX~P1fO!}$wO~O#U$yO#V$xO~O!}!ZX#U!ZX~P1fO!x$zO!}!ZX#U!ZX~O#U${O!}!YX~O!}$|O~O#Uxi#dxi~P1fOVay!gay!hay!iay!oay!}ay#Uay!Way#day!may#Vay~P1fO!}%PO~P$rO!}!yP#U!yP~P&rO!`%UO~P1fO!}%VO~O#V%WO~O!}%XO~P$rO!}%ZO~O",
  goto: "/p#rPPPPP#s$nP$u$x${PPPPPP%T%g%s'^'{(j)XP(j)['^PPPP'^P'^)_)|)_*P*V*Z)_)_*_P*_PP*_P*_P'^PP'^*|+S'^PPPPPPPPPPPPP+WPPP+[PPP+fP+iP,n,tP,z${-^PP${.TPPPPPP.dPPPPPPPPPPPPPPPPP${.p,t.v/X/b,t/j!qXTU^npx![!]!d!f!t!u!v!w!y!z!{!}#T#U#V#X#[#_#u#v$Q$V$X$Y$Z$[$a$s$v$x$z${%WZk_f!r#S#^Rm_R$S#^]!nx#U#[#_$Q$zU!ap!d#XY!hw!Z#O#Z#`Q$l$XR%R$ye!`pw!Z!d#O#X#Z#`$X$yQ{nQ#Q![Q#R!]Q#Y!fQ#h!tQ#i!uQ#j!vQ#k!wQ#m!yQ#n!zQ#o!{S#p!}$[Q#y#TQ#{#VQ$_#uQ$`#vQ$f$VW$i$X$v$x%WS$m$Y${Q$q$ZQ$t$aR$}$s!X!Sn![!]!f!t!u!v!w!y!z!{!}#T#V#u#v$V$X$Y$Z$[$a$s$v$x${%W!X}n![!]!f!t!u!v!w!y!z!{!}#T#V#u#v$V$X$Y$Z$[$a$s$v$x${%W!X|n![!]!f!t!u!v!w!y!z!{!}#T#V#u#v$V$X$Y$Z$[$a$s$v$x${%WR#f!sR#g!s!X!Rn![!]!f!t!u!v!w!y!z!{!}#T#V#u#v$V$X$Y$Z$[$a$s$v$x${%WR#d!rQ#s!}R$r$[T#r!}$[T#q!}$[!X!Qn![!]!f!t!u!v!w!y!z!{!}#T#V#u#v$V$X$Y$Z$[$a$s$v$x${%WQ$p$YR%T${T$o$Y${Tl_#SQROSVRgRg]RSOQYTQ]UQi^!Wzn![!]!f!t!u!v!w!y!z!{!}#T#V#u#v$V$X$Y$Z$[$a$s$v$x${%WU!_p!d#X]!lx#U#[#_$Q$zXQOR]gXPOR]gQ!qxQ#z#UQ$P#[Q$T#_Q$c$QR%S$z!W!On![!]!f!t!u!v!w!y!z!{!}#T#V#u#v$V$X$Y$Z$[$a$s$v$x${%W]!mx#U#[#_$Q$zQ!jwQ#P!ZQ#t#OQ$O#ZR$U#`Q$k$XQ%O$vQ%Q$xR%Y%WQ#b!qR$u$fQcYQviS!|{!cS#w#R#WR$b#|Q!cpQ#W!dR#|#XQZTV!bp!d#XQeZR#}#Y",
  nodeNames: "\u26A0 LineComment BlockComment ExpressionInOcl package Namespace Namespace context PropertyName Type Type Set Bag Sequence Collection OrderedSet Tuple VariableDeclaration VariableName OclExpression CallExp FeatureCallExp OperationCallExp MethodName pre PropertyCallExp PropertyName BinaryExp and or xor implies VariableExp self LiteralExp EnumLiteralExp EnumLiteral CollectionLiteralExp CollectionLiteralParts CollectionLiteralPart CollectionRange TupleLiteralExp PrimitiveLiteralExp NumericLiteral StringLiteral BooleanLiteralExp true false NullLiteralExp null InvalidLiteralExp invalid LetExp let in OclMessageExp OclMessageArguments OclMessageArg IfExp if then else endif OclAny OclInvalid OclMessage OclVoid init derive inv static def MethodName post body endpackage",
  maxTerm: 125,
  skippedNodes: [0, 1, 2],
  repeatNodeCount: 1,
  tokenData: "-R~RsX^#`pq#`tu$Twx$ixy%ayz%fz{%k{|%p|}%u}!O%z!O!P&g!P!Q&t!Q!R't!R![*a![!]+T!^!_+b!_!`+w!`!a+|!a!b,Z!b!c,`!c!}$T#Q#R,e#R#S$T#T#o$T#o#p,r#p#q,w#q#r,|#y#z#`$f$g#`#BY#BZ#`$IS$I_#`$I|$JO#`$JT$JU#`$KV$KW#`&FU&FV#`~#eY!q~X^#`pq#`#y#z#`$f$g#`#BY#BZ#`$IS$I_#`$I|$JO#`$JT$JU#`$KV$KW#`&FU&FV#`~$YT!s~tu$T!Q![$T!c!}$T#R#S$T#T#o$T~$lUOY$iZw$iwx%Ox#O$i#O#P%T#P~$i~%TO|~~%WROY$iYZ$iZ~$i~%fO!|~~%kO!}~~%pO#X~~%uO#Z~~%zO#U~~&PQ#[~}!O&V!`!a&b~&[QP~OY&VZ~&V~&gO#R~~&lP#S~!O!P&o~&tO#c~~&yP#Y~z{&|~'PSOz&|z{']{!P&|!Q~&|~'`TOz&|z{']{!P&|!P!Q'o!Q~&|~'tOQ~~'yR#e~!O!P(S!g!h)g#X#Y)g~(VP!Q![(Y~(_R#f~!Q![(Y!g!h(h#X#Y(h~(kS{|(w}!O(w!Q!R)Q!R![)V~(zQ!Q!R)Q!R![)V~)VO#f~~)[P#f~!Q![)_~)dP#f~!Q![)_~)jS{|)v}!O)v!Q!R)Q!R![*P~)yQ!Q!R)Q!R![*P~*UP#f~!Q![*X~*^P#f~!Q![*X~*fS#e~!O!P(S!Q![*r!g!h)g#X#Y)g~*wS#e~!O!P(S!Q![*r!g!h)g#X#Y)g~+YP!x~![!]+]~+bO!u~~+gQ#]~!_!`+m!`!a+r~+rO#_~~+wO#a~~+|O#Q~~,RP#^~!_!`,U~,ZO#`~~,`O#i~~,eO#T~~,jP#g~#Q#R,m~,rO#h~~,wO#b~~,|O#V~~-RO#d~",
  tokenizers: [0],
  topRules: {ExpressionInOcl: [0, 3]},
  specialized: [{term: 81, get: (value) => spec_simpleName[value] || -1}],
  tokenPrec: 0
});

// src/shared/codemirror/languages.ts
var languages = {
  javascript: () => import("@codemirror/lang-javascript").then((x) => x.javascriptLanguage),
  typescript: () => import("@codemirror/lang-javascript").then((x) => x.typescriptLanguage),
  jsx: () => import("@codemirror/lang-javascript").then((x) => x.jsxLanguage),
  tsx: () => import("@codemirror/lang-javascript").then((x) => x.tsxLanguage),
  python: () => import("@codemirror/lang-python").then((x) => x.pythonLanguage),
  cpp: () => import("@codemirror/lang-cpp").then((x) => x.cppLanguage),
  css: () => import("@codemirror/lang-css").then((x) => x.cssLanguage),
  markdown: () => import("@codemirror/lang-markdown").then((x) => x.markdownLanguage),
  ocl: () => Promise.resolve().then(() => __toModule(require_ocl())).then((x) => x.default)
};
languages.py = languages.python;
languages.ts = languages.typescript;
languages.js = languages.javascript;
var languages_default = languages;

// src/cli/markdown.ts
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
      return `<figure>${slf.renderToken(tokens, idx, opts)}<figcaption>${slf.renderInline(token?.children || [], opts, env)}</figcaption></figure>`;
    };
    this.md.renderer.rules.fence = function(tokens, idx, options2, env, slf) {
      const token = tokens[idx];
      let str = token.content;
      if (str.slice(-1) == "\n")
        str = str.slice(0, -1);
      const m = token.info.match(/\S+/);
      token.attrJoin("class", token.info);
      let res = '<div class="line">';
      const newline = "</div><div class='line'>";
      if (m && m[0] && env.highlighters[m[0]]) {
        const lang = env.highlighters[m[0]];
        let i = 0;
        highlightTree(lang.parseString(str), highlight_default.match, (from, to, classes) => {
          if (i < from)
            res += str.slice(i, from).replaceAll("\n", newline);
          res += `<span class="${classes}">`;
          res += str.slice(from, to).replaceAll("\n", `</span>${newline}<span class=${classes}>`);
          res += "</span>";
          i = to;
        });
        res += str.slice(i).replaceAll("\n", newline);
      } else {
        res += str.replaceAll("\n", newline);
      }
      res += "</div>";
      return "<pre" + slf.renderAttrs(token) + "><code>" + res + "</code></pre>";
    };
  }
  async render(input) {
    const env = {
      highlighters: {}
    };
    const parse5 = this.md.parse(input, env);
    const extractLanguages = async (tkn) => {
      if (tkn.type == "fence") {
        const m = tkn.info.match(/\S+/);
        if (m && m[0]) {
          if (languages_default[m[0]])
            env.highlighters[m[0]] = await languages_default[m[0]]();
        }
        return;
      } else {
        if (tkn.children) {
          await Promise.all(tkn.children.map(extractLanguages));
        }
        return;
      }
    };
    await Promise.all(parse5.map(extractLanguages));
    const res = this.md.renderer.render(parse5, this.md.options, env);
    return res;
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
var version = "1.4.1";
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
  "@codemirror/lang-cpp": "^0.17.0",
  "@codemirror/lang-css": "^0.17.0",
  "@codemirror/lang-html": "^0.17.0",
  "@codemirror/lang-java": "^0.17.0",
  "@codemirror/lang-javascript": "^0.17.0",
  "@codemirror/lang-json": "^0.17.0",
  "@codemirror/lang-markdown": "^0.17.0",
  "@codemirror/lang-python": "^0.17.0",
  "@codemirror/lang-rust": "^0.17.0",
  "@codemirror/lang-sql": "^0.17.0",
  "@codemirror/lang-xml": "^0.17.0",
  "@codemirror/language": "^0.17.0",
  "@codemirror/legacy-modes": "^0.17.0",
  "@codemirror/state": "^0.17.0",
  "@codemirror/view": "^0.17.0",
  "@hpcc-js/wasm": "1.2.0",
  "diagram-js": "7.2.0",
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
  "source-map-support": "^0.5.19",
  "style-mod": "^3.2.1",
  yaml: "^1.10.0",
  yargs: "^16.2.0"
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
  return (\u00B5) => \u00B5("div", {class: "submit"}, \u00B5("h1", {}, "Abgabe"), \u00B5("div", {class: "row"}, \u00B5("div", {}, \u00B5("p", {}, "Bitte gebt alle Autoren mit Matrikelnummer und Emailaddresse an und speichert dann eure L\xF6sung. Die gespeicherte JSON Datei sendet ihr dann an beide Tutoren per E-Mail.")), \u00B5("div", {}, \u00B5("div", {class: "authors"}))), \u00B5("div", {class: "buttons", id: props.buttons}));
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
  when(p, t2) {
    return p ? t2() : "";
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
  const body = await md.render(markdown);
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
            const {parser: parser2} = buildParserFile(source, {});
            return {
              contents: parser2,
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
  } else {
    return;
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
