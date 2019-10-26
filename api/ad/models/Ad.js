'use strict';
const FB = require('fb').default;

/**
 * Lifecycle callbacks for the `Ad` model.
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
        const adId = model.attributes.id;
        setTimeout(async () => {
            const ad = await strapi.query('ad').findOne({ id: adId });
            const campaign = await strapi.query('campaign').findOne({ id: ad.adset.campaign });
            const facebookEndPoint = `/act_${campaign.adaccount.account_id}/ads`;
            delete model.attributes.id;
            delete model.attributes.updated_at;
            delete model.attributes.created_at;
            delete model.attributes.adset;

            let adData = {
                creative: `{'creative_id': '${model.attributes.creative_id}'}`,
                name: `${model.attributes.name}`,
                status: `${model.attributes.status}`,
                adset_id: `${ad.adset.adset_facebook_id}`
            };
            FB.options(
                {
                    version: 'v4.0',
                    accessToken: campaign.token.app_token,
                    appId: campaign.token.app_id,
                    appSecret: campaign.token.app_secret
                }
            );

            FB.api(facebookEndPoint, 'POST',  adData , async (response)  => {
                if (!response || response.error) {
                    console.error('Error occured', response);
                } else {
                    await strapi.query('ad').update({ id: adId }, {
                        published: true,
                        ad_facebook_id: response.id
                    });
                }
            });
        }, 1000);
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
