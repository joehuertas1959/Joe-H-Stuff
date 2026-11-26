// Wraps dashboard.html (the hosted page's body) into a standalone index.html for local use.
// Run: node build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const body = readFileSync(join(here, "dashboard.html"), "utf8");
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>
</head>
<body>
<!-- Generated from dashboard.html by build.mjs. Edit dashboard.html, then rebuild. -->
${body}
</body>
</html>
`;
writeFileSync(join(here, "index.html"), html);
console.log("Wrote index.html");
