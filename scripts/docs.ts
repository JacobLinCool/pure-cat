import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import handler from "serve-handler";
import fetch from "node-fetch";

const packages = fs.readdirSync(path.resolve(process.cwd(), "packages"));

const collection = path.resolve(process.cwd(), "docs");
if (!fs.existsSync(collection)) {
    fs.mkdirSync(collection);
}

for (const p of packages) {
    const docs = path.resolve(process.cwd(), "packages", p, "docs");

    if (fs.existsSync(docs)) {
        fs.cpSync(docs, path.resolve(process.cwd(), "docs", p), { recursive: true });
    }
}

const server = http.createServer((request, response) => {
    return handler(request, response, { public: collection });
});

server.listen(54321, async () => {
    const text = await fetch("http://localhost:54321").then((res) => res.text());
    fs.writeFileSync(path.resolve(collection, "index.html"), text);
    server.close();
});
