'use strict';
// Using require() in ES5
const FB = require('fb').default;

/**
 * Lifecycle callbacks for the `Adset` model.
 */

module.exports = {
    // Before saving a value.
    // Fired before an `insert` or `update` query.
    // beforeSave: async (model, attrs, options) => {},

    // After saving a value.
    // Fired after an `insert` or `update` query.
    // afterSave: async (model, response, options) => {},

    // Before fetching a value.
    // Fired before a `fetch` operation.
    // beforeFetch: async (model, columns, options) => {},

    // After fetching a value.
    // Fired after a `fetch` operation.
    // afterFetch: async (model, response, options) => {},

    // Before fetching all values.
    // Fired before a `fetchAll` operation.
    // beforeFetchAll: async (model, columns, options) => {},

    // After fetching all values.
    // Fired after a `fetchAll` operation.
    // afterFetchAll: async (model, response, options) => {},

    // Before creating a value.
    // Fired before an `insert` query.
    // beforeCreate: async (model, attrs, options) => {},

    // After creating a value.
    // Fired after an `insert` query.
    afterCreate: async (model) => {
        setTimeout(async () => {
            const adSetId = model.attributes.id;
            const adset = await strapi.query('adset').findOne({ id: adSetId });

            if (adset.campaign) {
                const adaccount = await strapi.query('adaccount').findOne({ id: adset.campaign.adaccount });
                const token = await strapi.query('token').findOne({ id: adset.campaign.token });
                const facebookEndPoint = `/act_${adaccount.account_id}/adsets`;
                delete model.attributes.id;
                delete model.attributes.updated_at;
                delete model.attributes.created_at;
                let adsetData = model.attributes;
                adsetData.campaign_id = adset.campaign.facebook_id;
                adsetData.start_time = new Date(adset.start_time).getTime() / 1000;
                adsetData.end_time = new Date(adset.end_time).getTime() / 1000;

                FB.options(
                    {
                        version: 'v4.0',
                        accessToken: token.app_token,
                        appId: token.app_id,
                        appSecret: token.app_secret
                    }
                );
                FB.api(facebookEndPoint, 'POST',  adsetData , async (response)  => {
                    if (!response || response.error) {
                        console.error('Error occured', response);
                    } else {
                        await strapi.query('adset').update({ id: adSetId }, {
                            published: true,
                            adset_facebook_id: response.id
                        });
                    }
                });
            } else {
                console.error('Error');
            }

            //
        }, 100);
    },

    // Before updating a value.
    // Fired before an `update` query.
    // beforeUpdate: async (model, attrs, options) => {},

    // After updating a value.
    // Fired after an `update` query.
    // afterUpdate: async (model, attrs, options) => {},

    // Before destroying a value.
    // Fired before a `delete` query.
    // beforeDestroy: async (model, attrs, options) => {},

    // After destroying a value.
    // Fired after a `delete` query.
    // afterDestroy: async (model, attrs, options) => {}
};
