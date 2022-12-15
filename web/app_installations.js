import { Shopify } from "@shopify/shopify-api";
import stores from "./models/stores.js";

export const AppInstallations = {
  includes: async function (shopDomain) {
    const shopSessions = await Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);

    if (shopSessions.length > 0) {
      for (const session of shopSessions) {
        if (session.accessToken) return true;
      }
    }

    return false;
  },

  delete: async function (shopDomain) {
    const shopSessions = await Shopify.Context.SESSION_STORAGE.findSessionsByShop(shopDomain);
    if (shopSessions.length > 0) {
      await Shopify.Context.SESSION_STORAGE.deleteSessions(shopSessions.map((session) => session.id));
    }
    let store_ = await stores.findOne({shop:shopDomain});
    if(store_){ // update existing store
      let installed_days = 0;
      if(!store_.last_installed_at && store_.first_installed_at){ // first uninstall
        installed_days = new Date().getTime() - new Date(store_.first_installed_at).getTime();
        installed_days = Math.round(installed_days / (1000 * 3600 * 24));
      }
      else{ // recurring uninstall
        let old_days = store_.installed_days;
        installed_days = new Date().getTime() - new Date(store_.last_installed_at).getTime();
        installed_days = Math.round(installed_days / (1000 * 3600 * 24));
        installed_days = installed_days + old_days ;
      }
      await stores.where({shop:shopDomain}).update({
        uninstalled_at:new Date(),
        installed:false,
        installed_days
      });
    }
  },
};
