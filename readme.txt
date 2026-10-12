PARKING METER STORE — SETUP AND VIDEO DEMO GUIDE

Requirements
- Install Node.js (the LTS version is recommended).
- Extract the downloaded ZIP file.
- Open the extracted "parking-meter-store" folder in VS Code.

Run the site
1. Open Terminal > New Terminal in VS Code.
2. Confirm the terminal is in the folder containing server.js and package.json.
3. Run: npm start
4. Wait for the message that the server is running.
5. Open http://localhost:3000 in your browser.

No npm install command is needed because this project uses Node's built-in modules only.
Bootstrap is loaded from its public CDN, so an internet connection is needed for Bootstrap styling.

Pages
- Home: / and /index.html
- Products: /products.html
- Search: /search.html
- Checkout: /checkout.html
- Orders: /orders.html
- Contact: /contact.html

HTTP API examples
- GET /api/products?q=timer — search the product list
- GET /api/products — retrieve all products
- POST /api/orders — submit a checkout order
- PUT /api/cart — update the demo cart quantity
- DELETE /api/cart/:productId — remove a product from the demo cart

The server returns HTTP status codes such as 200, 201, 400, 404, and 405 as appropriate. No database is used; the product list and order records are held in server memory and reset when the server restarts.

Suggested 1–2 minute video
1. Show the downloaded ZIP in Brightspace and extract it.
2. Open the extracted folder in VS Code.
3. Open the terminal and run `npm start`.
4. Open http://localhost:3000.
5. Visit the home page and the three product cards.
6. Search for "timer" on the Search page.
7. Add a product / enter checkout details and submit the order.
8. Briefly mention that the Search page uses GET, checkout uses POST, quantity update uses PUT, and removing a cart item uses DELETE.

Stop the server with Ctrl+C in the terminal.
