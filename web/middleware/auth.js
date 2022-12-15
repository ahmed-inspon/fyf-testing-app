import { Shopify } from "@shopify/shopify-api";
import { gdprTopics } from "@shopify/shopify-api/dist/webhooks/registry.js";

import ensureBilling from "../helpers/ensure-billing.js";
import redirectToAuth from "../helpers/redirect-to-auth.js";
import stores from "../models/stores.js";

export default function applyAuthMiddleware(
  app,
  { billing = { required: false } } = { billing: { required: false } }
) {
  app.get("/api/auth", async (req, res) => {
    return redirectToAuth(req, res, app)
  });

  app.get("/api/auth/callback", async (req, res) => {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query
      );

      const responses = await Shopify.Webhooks.Registry.registerAll({
        shop: session.shop,
        accessToken: session.accessToken,
      });

      Object.entries(responses).map(([topic, response]) => {
        // The response from registerAll will include errors for the GDPR topics.  These can be safely ignored.
        // To register the GDPR topics, please set the appropriate webhook endpoint in the
        // 'GDPR mandatory webhooks' section of 'App setup' in the Partners Dashboard.
        if (!response.success && !gdprTopics.includes(topic)) {
          if (response.result.errors) {
            console.log(
              `Failed to register ${topic} webhook: ${response.result.errors[0].message}`
            );
          } else {
            console.log(
              `Failed to register ${topic} webhook: ${
                JSON.stringify(response.result.data, undefined, 2)
              }`
            );
          }
        }
      });

      //install or update store in db
      let store_ = await stores.findOne({shop:session.shop});
      if(!store_){ //create new store
        console.log("session.shop,session.accessToken ",session.shop,
        session.accessToken);
        const client = new Shopify.Clients.Graphql(
          session.shop,
          session.accessToken
        );
        let country = null;
        let city = null;
        let shop_owner = null;
        let plan_name = null;
        let email = null;
        let phone = null;

        let cq = await client.query({ data: `
        {
          shop {
            name
            plan{
              displayName
            }
            email   
          }
        }` });
        console.log("cq",cq);
        if(cq && cq.body?.data && cq.body?.data?.shop){
          let shop_ = cq.body?.data?.shop;
          // city = shop_.billingAddress?.city;
          // country = shop_.billingAddress?.country;
          // phone = shop_.billingAddress?.phone;
          // shop_owner = shop_.billingAddress?.name;
          plan_name = shop_.plan?.displayName;
          email = shop_.email;
        }
        await stores.create({
          shop:session.shop,
          first_installed_at:new Date(),
          phone,
          country,
          city,
          shop_owner,
          plan_name,
          email,
          installed:true,
          });
      }
      else{ // update existing store
        await stores.where({shop:session.shop}).update({
          last_installed_at:new Date(),
          installed:true,
        });
      }

      // If billing is required, check if the store needs to be charged right away to minimize the number of redirects.
      if (billing.required) {
        const [hasPayment, confirmationUrl] = await ensureBilling(
          session,
          billing
        );

        if (!hasPayment) {
          return res.redirect(confirmationUrl);
        }
      }

      const host = Shopify.Utils.sanitizeHost(req.query.host);
      const redirectUrl = Shopify.Context.IS_EMBEDDED_APP
        ? Shopify.Utils.getEmbeddedAppUrl(req)
        : `/?shop=${session.shop}&host=${encodeURIComponent(host)}`;

      res.redirect(redirectUrl);
    } catch (e) {
      console.warn(e);
      switch (true) {
        case e instanceof Shopify.Errors.InvalidOAuthError:
          res.status(400);
          res.send(e.message);
          break;
        case e instanceof Shopify.Errors.CookieNotFound:
        case e instanceof Shopify.Errors.SessionNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          return redirectToAuth(req, res, app);
          break;
        default:
          res.status(500);
          res.send(e.message);
          break;
      }
    }
  });
}
