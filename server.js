const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const products = [
  { id: "timer", name: "Compact Parking Timer", price: 19.99, category: "Accessories", description: "A simple dashboard timer to help track parking time.", icon: "⏱️" },
  { id: "mount", name: "Dashboard Phone Mount", price: 24.99, category: "Accessories", description: "A sturdy mount that keeps your phone in view while parked.", icon: "📱" },
  { id: "sign", name: "Reflective Parking Sign", price: 14.99, category: "Signs", description: "A reflective sign for clearly marking a reserved parking space.", icon: "🅿️" }
];

let orders = [];
let nextOrderId = 1001;
let cart = { timer: 1, mount: 0, sign: 0 };

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Request body must be valid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(res, pathname) {
  // The root URL serves index.html, making the landing page available at http://localhost:3000.
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(PUBLIC_DIR, requested);

  // Only files inside the public folder can be served.
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== path.join(PUBLIC_DIR, "index.html")) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("403 Forbidden");
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("404 Page not found");
    }
    res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);

  try {
    if (pathname === "/api/products" && req.method === "GET") {
      const query = (url.searchParams.get("q") || "").trim().toLowerCase();
      const matches = products.filter(product =>
        `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query)
      );
      return sendJson(res, 200, { products: matches, count: matches.length, query });
    }

    if (pathname === "/api/orders" && req.method === "GET") {
      return sendJson(res, 200, { orders });
    }

    if (pathname === "/api/orders" && req.method === "POST") {
      const body = await readBody(req);
      if (!body.name || !body.email || !Array.isArray(body.items) || body.items.length === 0) {
        return sendJson(res, 400, { error: "Name, email, and at least one item are required." });
      }

      const items = [];
      for (const requestedItem of body.items) {
        const product = products.find(item => item.id === requestedItem.id);
        const quantity = Number(requestedItem.quantity);
        if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
          return sendJson(res, 400, { error: "One or more order items are invalid." });
        }
        items.push({ id: product.id, name: product.name, price: product.price, quantity });
      }

      const order = {
        id: nextOrderId++,
        name: String(body.name).trim(),
        email: String(body.email).trim(),
        items,
        total: Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)),
        createdAt: new Date().toISOString()
      };
      orders.push(order);
      return sendJson(res, 201, { message: "Order created successfully.", order });
    }

    if (pathname === "/api/cart" && req.method === "PUT") {
      const body = await readBody(req);
      const product = products.find(item => item.id === body.id);
      const quantity = Number(body.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
        return sendJson(res, 400, { error: "Provide a valid product id and quantity from 0 to 99." });
      }
      cart[product.id] = quantity;
      return sendJson(res, 200, { message: "Cart quantity updated.", cart });
    }

    const deleteMatch = pathname.match(/^\/api\/cart\/([^/]+)$/);
    if (deleteMatch && req.method === "DELETE") {
      const product = products.find(item => item.id === deleteMatch[1]);
      if (!product) return sendJson(res, 404, { error: "Product not found." });
      cart[product.id] = 0;
      return sendJson(res, 200, { message: `${product.name} removed from the demo cart.`, cart });
    }

    if (pathname.startsWith("/api/")) {
      const allowedPath = ["/api/products", "/api/orders", "/api/cart"].includes(pathname) || /^\/api\/cart\/[^/]+$/.test(pathname);
      if (!allowedPath) return sendJson(res, 404, { error: "API endpoint not found." });
      return sendJson(res, 405, { error: "Method not allowed for this endpoint." });
    }

    if (req.method !== "GET") {
      res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", "Allow": "GET" });
      return res.end("405 Method Not Allowed");
    }

    return serveStatic(res, pathname);
  } catch (error) {
    const status = error.message === "Request body must be valid JSON" ? 400 : 500;
    return sendJson(res, status, { error: status === 400 ? error.message : "Internal server error." });
  }
});

server.listen(PORT, () => {
  console.log(`Parking Meter Store running at http://localhost:${PORT}`);
});
