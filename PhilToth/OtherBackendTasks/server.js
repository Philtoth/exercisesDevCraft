const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3000;
const staticDir = "public";
const validPaths = [
    "http://lokale-seite-eins:3000/",
    "http://lokale-seite-zwei:3000/"
];

// --- Helpers ------------------------------------------------------------

const setCorsHeaders = (req, res) => {
    const origin = req.headers.origin;
    if (validPaths.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
};

const setCacheHeader = (res, data) => {
    const fileHash = crypto.createHash("sha256").update(data).digest("hex");
    res.setHeader("ETag", fileHash);
    res.setHeader("Cache-Control", "public, max-age=31536000");
};

const checkCookies = (req, res) => {
    if (!req.headers.cookie || !req.headers.cookie.includes("uniqueId")) {
        const uniqueId = crypto.randomBytes(16).toString("hex");
        // use Set-Cookie instead of res.cookie()
        res.setHeader("Set-Cookie", `uniqueId=${uniqueId}; Path=/; Max-Age=31536000`);
        console.log(`Set uniqueId cookie: ${uniqueId}`);
    } else {
        const match = req.headers.cookie.match(/uniqueId=([a-f0-9]{32})/);
        if (match) {
            console.log(`Received uniqueId cookie: ${match[1]}`);
        }
    }
};

// --- NEW: add a helper to guess content type ---
const getContentType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case ".html": return "text/html; charset=utf-8";
        case ".css": return "text/css; charset=utf-8";
        case ".js": return "application/javascript; charset=utf-8";
        case ".jpg":
        case ".jpeg": return "image/jpeg";
        case ".png": return "image/png";
        case ".gif": return "image/gif";
        case ".svg": return "image/svg+xml";
        default: return "application/octet-stream";
    }
};

// --- Middleware ---------------------------------------------------------

const serverMiddleware = (baseDir = staticDir) => {
    return (req, res, next) => {
        const basePath = path.join(__dirname, baseDir);
        const requestedPath = path.join(__dirname, req.path);

        // --- NEW: safer path check to block "../" traversal ---
        const normalized = path.normalize(requestedPath);
        if (!normalized.startsWith(basePath)) {
            res.status(403).send("Forbidden");
            return;
        }

        setCorsHeaders(req, res);

        fs.readFile(normalized, (err, data) => {
            if (err) {
                if (err.code === "ENOENT") {
                    res.status(404).send("File not found");
                    return;
                }
                console.error("File read error:", err);
                res.status(500).send("Server error");
                return;
            }

            // headers + cookie
            setCacheHeader(res, data);
            checkCookies(req, res);

            fs.stat(normalized, (statErr, stats) => {
                if (!statErr && stats.mtime) {
                    res.setHeader("Last-Modified", stats.mtime.toUTCString());
                }

                // --- NEW: set content type header ---
                res.setHeader("Content-Type", getContentType(normalized));
                res.status(200).send(data);
                next();
            });
        });
    };
};

// -----------------------------------------------------------------------

app.use(serverMiddleware());

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
