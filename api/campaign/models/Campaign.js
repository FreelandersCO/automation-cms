'use strict';
// Using require() in ES5
const FB = require('fb').default;

/**
 * Lifecycle callbacks for the `Campaign` model.
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
    //beforeCreate: async (model, attrs, options) => {},

    // After creating a value.
    // Fired after an `insert` query.
    afterCreate: async (model) => {

        setTimeout( async () => {
            const campaignId = model.attributes.id;
            const campaing = await strapi.query('campaign').findOne({ id: campaignId });
            const facebookEndPoint = `/act_${campaing.adaccount.account_id}/campaigns`;
            delete model.attributes.id;
            delete model.attributes.updated_at;
            delete model.attributes.created_at;
            const campaignData = model.attributes;

            FB.options(
                {
                    version: 'v4.0',
                    accessToken: campaing.token.app_token,
                    appId: campaing.token.app_id,
                    appSecret: campaing.token.app_secret
                }
            );

            FB.api(facebookEndPoint, 'POST',  campaignData , async (response)  => {
                if (!response || response.error) {
                    console.error('Error occured', response);
                } else {
                    await strapi.query('campaign').update({ id: campaignId }, {
                        published: true,
                        facebook_id: response.id
                    });
                }
            });
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
