# House of Gina

Static, responsive storefront demo built with HTML, CSS, and vanilla JavaScript.
Product images and web fonts are loaded from external services.

## Local use

1. Install Node.js.
2. Run `npm install`.
3. Run `npm run build` to generate the production Tailwind stylesheet.
4. Open `index.html` in a browser or serve this folder with a static file server.

## Demo limitations

This project is a front-end demonstration, not a live ecommerce system.
Checkout does not charge a payment method or create an order, account sign-in is
local to the browser, and contact/newsletter forms do not send or store
submissions. The admin dashboard and its sample customer/order data are also
client-side demos; they are not protected and must not be used for real business
data. Do not enter real payment details or passwords.

Before using this as a live store, connect a secure backend and payment
provider, add real authentication and form delivery, replace sample content and
links, and publish accurate privacy, terms, shipping, and returns policies.

## Deploying to Vercel

Import the GitHub repository into Vercel, choose **Other** as the framework,
set the build command to `npm run build`, and set the output directory to `.`.
Vercel will serve `index.html` and the generated assets as a static site.
