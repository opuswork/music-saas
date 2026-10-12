/**
 * Runs Prisma Studio and drops known benign Node stream noise (ERR_STREAM_PREMATURE_CLOSE,
 * ERR_STREAM_UNABLE_TO_PIPE) that Studio logs when the browser or embedded preview disconnects.
 * Filters both stdout and stderr — Studio may write these blocks to either stream.
 * Invokes the local Prisma CLI with Node (no shell / npx) for more stable stdio on Windows.
 *
 * If the preferred port (default 5555, or PRISMA_STUDIO_PORT) is already in use, picks a free
 * port automatically so a leftover Studio or other process does not block startup.
 *
 * @see https://github.com/prisma/studio/issues/1479
 */
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const net = require("net");

const apiRoot = path.resolve(__dirname, "..");

function resolvePrismaCli() {
  try {
    const pkgJson = require.resolve("prisma/package.json", { paths: [apiRoot] });
    const root = path.dirname(pkgJson);
    const js = path.join(root, "build", "index.js");
    if (fs.existsSync(js)) {
      return js;
    }
  } catch {
    /* fall through */
  }
  return null;
}

/** Returns whether `port` can be bound the same way `server.listen(port)` does (all interfaces). */
function probePort(port) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.once("error", reject);
    srv.listen(port, () => {
      const addr = srv.address();
      const chosen = typeof addr === "object" && addr ? addr.port : port;
      srv.close((err) => {
        if (err) reject(err);
        else resolve(chosen);
      });
    });
  });
}

async function pickStudioPort(preferredRaw) {
  const trimmed = String(preferredRaw ?? "").trim();
  const parsed = parseInt(trimmed, 10);
  const preferred = Number.isFinite(parsed) && parsed > 0 ? parsed : 5555;

  try {
    await probePort(preferred);
    return preferred;
  } catch (e) {
    if (e.code !== "EADDRINUSE") {
      throw e;
    }
    const auto = await probePort(0);
    process.stderr.write(
      `[studio] Port ${preferred} is already in use; starting on ${auto} instead.\n` +
        `[studio] Open http://127.0.0.1:${auto} in your browser.\n`
    );
    return auto;
  }
}

const prismaJs = resolvePrismaCli();

let suppressStudioStreamNoise = false;

function shouldStartSuppress(line) {
  const hasStudioTag = line.includes("Prisma Studio") || line.includes("[Prisma Studio]");
  const hasNoise =
    line.includes("ERR_STREAM_PREMATURE_CLOSE") || line.includes("ERR_STREAM_UNABLE_TO_PIPE");
  return hasStudioTag && hasNoise;
}

function flushLine(line, dest) {
  if (!line) return;

  if (!suppressStudioStreamNoise) {
    if (shouldStartSuppress(line)) {
      suppressStudioStreamNoise = true;
      return;
    }
    dest.write(line + "\n");
    return;
  }

  const t = line.trim();
  if (t === "}") {
    suppressStudioStreamNoise = false;
  }
}

function wireFilteredStream(stream, dest) {
  let carry = "";
  stream.on("data", (chunk) => {
    carry += chunk.toString("utf8");
    const parts = carry.split(/\r?\n/);
    carry = parts.pop() ?? "";
    for (const line of parts) {
      flushLine(line, dest);
    }
  });
  stream.on("end", () => {
    if (carry) {
      flushLine(carry, dest);
      carry = "";
    }
  });
}

async function main() {
  const studioPort = await pickStudioPort(process.env.PRISMA_STUDIO_PORT);
  const portArg = String(studioPort);
  const studioArgs = ["studio", "--port", portArg, "--browser", "none"];

  const child = prismaJs
    ? spawn(process.execPath, [prismaJs, ...studioArgs], {
        cwd: apiRoot,
        stdio: ["inherit", "pipe", "pipe"],
        env: process.env,
        windowsHide: true,
      })
    : spawn("npx", ["prisma", ...studioArgs], {
        cwd: apiRoot,
        stdio: ["inherit", "pipe", "pipe"],
        shell: true,
        env: process.env,
        windowsHide: true,
      });

  wireFilteredStream(child.stdout, process.stdout);
  wireFilteredStream(child.stderr, process.stderr);

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 0);
  });
}

main().catch((err) => {
  process.stderr.write(String(err && err.stack ? err.stack : err) + "\n");
  process.exit(1);
});
