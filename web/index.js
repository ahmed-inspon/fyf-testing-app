// @ts-check
//      https://874e-192-140-145-172.in.ngrok.io?shop=fyf-test.myshopify.com&host=ZnlmLXRlc3QubXlzaG9waWZ5LmNvbS9hZG1pbg
import { join } from "path";
import { readFileSync } from "fs";
import express, { response } from "express";
import cookieParser from "cookie-parser";
import axios from "axios";
import fetch from 'node-fetch';
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
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const USE_ONLINE_TOKENS = false;
console.log("SHOPIFY_API_KEY",process.env.SHOPIFY_API_KEY);
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

// TODO: There should be provided by env vars
const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
const PROD_INDEX_PATH = `${process.cwd()}/web/frontend/dist/`;
let db_name = process.env.DB_NAME ?? "fyf"; 
main().catch(err => console.log(err));
async function main() {
  await Mongoose.connect('mongodb+srv://sell-quicky-admin:SUYJGBqfQ5tOGFvj@cluster0.po1dbmb.mongodb.net/'+db_name);
  console.log("db-name",db_name);
  // await Mongoose.connect('mongodb+srv://parnter_dashboard:XMe3Gbn3EtU6SXJh@cluster0.wdhsgsr.mongodb.net/fyf_test');
  // use `await Mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}
const DB_PATH = `${process.cwd()}/database.sqlite`;
// const sessionDb = new Shopify.Session.MongoDBSessionStorage(new URL("mongodb+srv://parnter_dashboard:XMe3Gbn3EtU6SXJh@cluster0.wdhsgsr.mongodb.net"), "fyf_test");
const sessionDb = new Shopify.Session.MongoDBSessionStorage(new URL("mongodb+srv://sell-quicky-admin:SUYJGBqfQ5tOGFvj@cluster0.po1dbmb.mongodb.net"), db_name);

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: ["read_products","read_themes"],
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
    console.log("deleting store");
    await AppInstallations.delete(shop);
  },
});

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const BILLING_SETTINGS = {
  required: process.env.PAYMENT_REQUIRED == "true",
  test:process.env.PAYMENT_TEST == "true",
  // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
  chargeName: "Base Plan",
  amount: 2.99,
  currencyCode: "USD",
  trial:3,
  interval: BillingInterval.Every30Days,
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
  app.use(cors());
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
 //app extenion end points
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
    // shop = shop + ".myshopify.com";
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
 //app entension end points
  // All endpoints after this point will require an active session
  app.use(
    "/api/*",
    verifyRequest(app, {
      billing: billingSettings,
    })
  );
  // app.get("/api", (req, res) => {
  //   return res.send("dd");
  // })

  app.get('/api/os_check' ,async (req,res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let {shop,accessToken} = session;
    let theme_id = req.query.theme_id;
    if(!theme_id || theme_id == "" )
    {
        return res.status(400).json({success:false,"message":"theme_id is required in body"}); 
    }
    let theme = null;
    let data = null;
    let success = false;
    let matchesFiles = [];
        
    theme = await axios.get('https://'+process.env.SHOPIFY_API_KEY+':'+accessToken+
    '@'+shop + '/admin/api/2020-01/themes/'+theme_id+'/assets.json');
    if(theme.data)
    {
        theme = theme.data;
        const files_to_look = [
            "templates/product.json",
            "templates/collection.json",
            "templates/index.json",
        ];
        for (
        let index = 0;
        index < theme.assets.length;
        index++
        ) {
            const asset = theme.assets[index];
            if (files_to_look.indexOf(asset.key) !== -1) {
                let single_file_data = await axios.get('https://'+process.env.SHOPIFY_API_KEY
                +':'+accessToken +
                '@'+shop + '/admin/api/2021-04/themes/'+theme_id+'/assets.json?asset[key]='+asset.key);
                if(single_file_data.data){
                    single_file_data = single_file_data.data;
                }
              
                const file_data = JSON.parse(single_file_data.asset.value);
                const get_main_type = file_data?.sections?.main?.type;

                if (get_main_type) {
                    let get_section_file = await axios.get('https://'+process.env.SHOPIFY_API_KEY
                    +':'+accessToken +
                    '@'+shop + '/admin/api/2021-04/themes/'+theme_id+'/assets.json?asset[key]='+"sections/" + get_main_type + ".liquid");
                    if(get_section_file.data){
                        get_section_file =  get_section_file.data;
                    }
                
                const section_file_data = get_section_file.asset.value;

                const match_schema = section_file_data.match(new RegExp('\\{\\%\\s+schema\\s+\\%\\}([\\s\\S]*?)\{\\%\\s+endschema\\s+\\%\\}', 'm'));
            
                if(match_schema){
                    const section_schema = JSON.parse(match_schema[0].replace("{% schema %}", "").replace("{% endschema %}", ""));
                    section_schema.blocks.forEach(block => {
                    if(block.type === "@app"){
                        matchesFiles.push(asset.key);
                    }
                    })
                }
                // console.log(section_file_data);
                }
            }
        }

    }
    else{
        console.log("theme",theme);
    }
    if(matchesFiles.length){
        success = true;
    }
    return res.status(success == true ? 200 : 400).json({success,data:matchesFiles});

});

app.get('/api/check_block_in_theme' ,async (req,res) => {

    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let {shop,accessToken} = session;
    let theme_id = req.query.theme_id;
    let blocks = null;
    let data = [];
    if(!theme_id || theme_id == "" )
    {
        return res.status(400).json({success:false,"message":"theme_id is required in body"}); 
    }
    try{
        let get_settings_data = await axios.get('https://'+process.env.SHOPIFY_API_KEY+':'+ accessToken+
        '@'+shop + '/admin/api/2021-04/themes/'+theme_id+'/assets.json?asset[key]=config/settings_data.json');
        if(get_settings_data?.data){
            get_settings_data = get_settings_data?.data;
        }
        // const get_settings_data = await assets_api.get_single_asset(shop, storeData.accessToken, theme_id, 'config/settings_data.json');
        // const settings_data = JSON.parse(get_settings_data.snippet.asset.value);
        const settings_data = JSON.parse(get_settings_data?.asset?.value);
        console.log("settings_data",settings_data);

        let if_block = false;
        if(settings_data?.current?.blocks){
            blocks = Object.keys(settings_data?.current?.blocks);
    
            blocks.forEach(block => {
            const current_block = settings_data?.current?.blocks[block];
            console.log("block",current_block.type); // use this line to find available block
            
            //dev blcok id ab92ea17-5dbb-4f16-ac05-0ddb0b48990e
            let app_block_id = "f9901e53-c767-4506-a6f8-a3560b6b7626";
            //'shopify://apps/find-your-fit-clothing-chart/blocks/app-embed/f9901e53-c767-4506-a6f8-a3560b6b7626'
            if(current_block.type.includes(app_block_id)){
                if(current_block.disabled == false){
                if_block = true;
                }
            }
            });
        }
        return res.status(200).json({success:true,is_block:if_block});
    }
    catch(err){
        return res.status(400).json({success:false,err});
    }
});

  app.get("/api/get_themes",async(req,res)=>{
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    // try {
      const response = await axios.get(
        `https://${process.env.SHOPIFY_API_KEY}:${session.accessToken}@${session.shop}/admin/api/2022-07/themes.json`,{
          headers: { Accept: 'application/json', 'Accept-Encoding': 'identity' },
        }
      );
      const data = response.data;
      console.log("thmedata",`https://${process.env.SHOPIFY_API_KEY}:${session.accessToken}@${session.shop}/admin/api/2022-07/themes.json`)
      return res.status(200).json({ success: true,data,url:`https://${process.env.SHOPIFY_API_KEY}:${session.accessToken}@${session.shop}/admin/api/2022-07/themes.json` });
    // } catch (err) {
    //   console.log(err);
    //   return res.status(400).json({ success: false,err, message: "error in getting theme ids" });
    // }
  });
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

  app.post("/api/set_theme_setup", async (req, res) => {

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
      let store_settings_ = await store_settings.update({ shop },
        { theme_setup:true }, { upsert: true, setDefaultsOnInsert: true });
      if (store_settings_) {
        data = store_settings_;
      }

    } catch (e) {
      console.log(`Failed to process /api/set_theme_setup: ${e.message}`);
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
        await measurement.delete();
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
      let type = req.body.type;
      let products = req.body.products;
      let title = req.body.title;
      let unit = req.body.unit;
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
          let update = await exist.update({sizes, title, products,type,unit});
          data = update;
        }
      } else {
        let create = await measurements.create({ shop, sizes, title, products,type,unit});
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
    console.log("hello world4",isProd);

    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(readFileSync(htmlFile));
  });

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));
