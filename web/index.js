// @ts-check
//
//   https://55e5-182-189-247-70.eu.ngrok.io?shop=fyf-testing.myshopify.com&host=ZnlmLXRlc3RpbmcubXlzaG9waWZ5LmNvbS9hZG1pbg       
import { join } from "path";
import { readFileSync } from "fs";
import express, { response } from "express";
import cookieParser from "cookie-parser";
import { Shopify, LATEST_API_VERSION } from "@shopify/shopify-api";
import Mongoose from 'mongoose';
import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import { setupGDPRWebHooks } from "./gdpr.js";
import productCreator from "./helpers/product-creator.js";
import redirectToAuth from "./helpers/redirect-to-auth.js";
import { BillingInterval } from "./helpers/ensure-billing.js";
import { AppInstallations } from "./app_installations.js";
import measurements from "./models/measurements.js";
import store_settings from "./models/store_settings.js";
import dotenv from 'dotenv';
dotenv.config();
const USE_ONLINE_TOKENS = false;
console.log("SHOPIFY_API_KEY",process.env.SHOPIFY_API_KEY);
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

// TODO: There should be provided by env vars
const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;
main().catch(err => console.log(err));
async function main() {
  await Mongoose.connect('mongodb+srv://sell-quicky-admin:SUYJGBqfQ5tOGFvj@cluster0.po1dbmb.mongodb.net/fyf');

  // await Mongoose.connect('mongodb+srv://parnter_dashboard:XMe3Gbn3EtU6SXJh@cluster0.wdhsgsr.mongodb.net/fyf_test');
  // use `await Mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}
const DB_PATH = `${process.cwd()}/database.sqlite`;
// const sessionDb = new Shopify.Session.MongoDBSessionStorage(new URL("mongodb+srv://parnter_dashboard:XMe3Gbn3EtU6SXJh@cluster0.wdhsgsr.mongodb.net"), "fyf_test");
const sessionDb = new Shopify.Session.MongoDBSessionStorage(new URL("mongodb+srv://sell-quicky-admin:SUYJGBqfQ5tOGFvj@cluster0.po1dbmb.mongodb.net"), "fyf");

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https?:\/\//, ""),
  HOST_SCHEME: process.env.HOST.split("://")[0],
  API_VERSION: LATEST_API_VERSION,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  // See note below regarding using CustomSessionStorage with this template.
  SESSION_STORAGE: sessionDb,
  // SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH),
  ...(process.env.SHOP_CUSTOM_DOMAIN && { CUSTOM_SHOP_DOMAINS: [process.env.SHOP_CUSTOM_DOMAIN] }),
});

// NOTE: If you choose to implement your own storage strategy using
// Shopify.Session.CustomSessionStorage, you MUST implement the optional
// findSessionsByShopCallback and deleteSessionsCallback methods.  These are
// required for the app_installations.js component in this template to
// work properly.

Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/api/webhooks",
  webhookHandler: async (_topic, shop, _body) => {
    await AppInstallations.delete(shop);
  },
});

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const BILLING_SETTINGS = {
  required: false,
  // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
  // chargeName: "My Shopify One-Time Charge",
  // amount: 5.0,
  // currencyCode: "USD",
  // interval: BillingInterval.OneTime,
};

// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
  billingSettings = BILLING_SETTINGS
) {
  const app = express();

  app.set("use-online-tokens", USE_ONLINE_TOKENS);
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app, {
    billing: billingSettings,
  });

  // Do not call app.use(express.json()) before processing webhooks with
  // Shopify.Webhooks.Registry.process().
  // See https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md#note-regarding-use-of-body-parsers
  // for more details.
  app.post("/api/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (e) {
      console.log(`Failed to process webhook: ${e.message}`);
      if (!res.headersSent) {
        res.status(500).send(e.message);
      }
    }
  });

  // All endpoints after this point will require an active session
  // app.use(
  //   "/api/*",
  //   verifyRequest(app, {
  //     billing: billingSettings,
  //   })
  // );
  app.get("/api", (req, res) => {
    return res.send("dd");
  })
  app.get("/api/products/count", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.get("/api/products/create", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = null;

    try {
      await productCreator(session);
    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
  });

  // All endpoints after this point will have access to a request.body
  // attribute, as a result of the express.json() middleware
  app.use(express.json());

  app.get("/api/store_settings",async(req,res)=>{
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = null;
    let data = null;
    try {
      let shop = session?.shop;

      let store_settings_ = await store_settings.findOne({ shop });
      if (store_settings_) {
        data = store_settings_;
      }

    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error, data });

  })
  app.post("/api/store_settings", async (req, res) => {

    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = null;
    let data = null;
    try {
      let shop = session?.shop;
      let unit = req.body.unit;
      let appearance = req.body.appearance;
      let store_settings_ = await store_settings.update({ shop },
        { unit,appearance }, { upsert: true, setDefaultsOnInsert: true });
      if (store_settings_) {
        data = store_settings_;
      }

    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error, data });

  });

  app.get("/api/app_extension", async (req, res) => {
    // const session = await Shopify.Utils.loadCurrentSession(
    //   req,
    //   res,
    //   app.get("use-online-tokens")
    // );
    let status = 200;
    let error = "";
    let data = {};
    try {
      // let shop = session?.shop;
      let shop = req.query.shop;
      shop = shop + ".myshopify.com";
      // console.log("shop", shop);
      data.measurements = await measurements.find({ shop });
      data.store_settings = await store_settings.findOne({ shop });
      // console.log("data", data);

    } catch (e) {
      console.log(`Failed to process /measurements: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error, data: data });

  });

  app.get("/api/measurements", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = "";
    let data = {};
    try {
      let shop = session?.shop;
      // let shop = req.query.shop;
      // shop = shop +".myshopify.com";
      console.log("shop", shop);
      data.measurements = await measurements.find({ shop });
      data.store_settings = await store_settings.findOne({ shop });
      console.log("data", data);

    } catch (e) {
      console.log(`Failed to process /measurements: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error, data: data });

  });

  app.delete("/api/measurements/:id",async(req,res)=>{
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = "";
    let data = {};
    let id = req.params.id
    try {
      let shop = session?.shop;
      // let shop = req.query.shop;
      // shop = shop +".myshopify.com";
      console.log("shop", shop);
      let measurement = await measurements.findById(id);
      if(measurement){
        measurement.delete();
      }
      data.measurements = await measurements.find({ shop });
      
    } catch (e) {
      console.log(`Failed to process /measurements: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error, data: data });

  })

  app.get("/api/measurements/:id", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = "";
    let data = {};
    let id = req.params.id
    try {
      let shop = session?.shop;
      // let shop = req.query.shop;
      // shop = shop +".myshopify.com";
      console.log("shop", shop);
      data.measurements = await measurements.findById(id);
      data.store_settings = await store_settings.findOne({ shop });

    } catch (e) {
      console.log(`Failed to process /measurements: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error, data: data });

  });

  app.post("/api/measurements/create_update", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = null;
    let data = null;
    try {
      console.log(session, req.body);
      let shop = session?.shop;
      let size = req.body.size;
      // let waist = req.body.waist;
      // let chest = req.body.chest;
      let id = req.body.id;
      let sizes = req.body.sizes;
      let products = req.body.products;
      let title = req.body.title;
      let gender = req.body.gender;
      // let neck = req.body.neck;
      // let hips = req.body.hips;
      // let pant = req.body.pant;
      // let existing_size = await measurements.findOne({shop,size,gender});
      // if(existing_size){
      //   status = 500;
      //   error = "Measurement already exist for this gender and size";
      // }
      // else{
      // let create = await measurements.create({shop,size,waist,chest,gender,neck,hips,pant});
      if (id) {
        let exist = await measurements.findById(id);
        if(exist){
          let update = await exist.update({sizes, title, products });
          data = update;
        }
      } else {
        let create = await measurements.create({ shop, sizes, title, products });
        data = create;
      }
      
      // }

    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error, data });
  });

  app.use((req, res, next) => {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    console.log("step 1", shop);
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${encodeURIComponent(
          shop
        )} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  if (isProd) {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    app.use(compression());
    app.use(serveStatic(PROD_INDEX_PATH, { index: false }));
  }

  app.use("/*", async (req, res, next) => {
    if (typeof req.query.shop !== "string") {
      res.status(500);
      return res.send("No shop provided");
    }
    console.log("step 2", req.query.shop);
    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled && !req.originalUrl.match(/^\/exitiframe/i)) {
      // if (!appInstalled) {
      console.log("step 3", appInstalled, req.originalUrl);
      return redirectToAuth(req, res, app);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== "1") {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);
      console.log("step 4", embeddedUrl);

      return res.redirect(embeddedUrl + req.path);
    }

    const htmlFile = join(
      isProd ? PROD_INDEX_PATH : DEV_INDEX_PATH,
      "index.html"
    );
    console.log("hello world4");

    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(readFileSync(htmlFile));
  });

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));
