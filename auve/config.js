/* ============================================================================
 * AUVÉ dynamic store — SERVER CONFIGURATION
 * ----------------------------------------------------------------------------
 * This file is read ONLY by server.js. It is never served to the browser
 * (server.js blocks it), because it can hold secrets.
 *
 * Every value can also be set with an environment variable of the same name
 * (see .env.example). Environment variables win over the values below.
 *
 * >>> PLACEHOLDERS: everything marked TODO(client) must be replaced with the
 * >>> client's real credentials before going live. Do not commit real secrets
 * >>> to a public repository.
 * ==========================================================================*/
'use strict';

module.exports = {
  /* Port the server listens on. */
  port: 8080,

  /* ------------------------------------------------------------------
   * ADMIN PASSWORD for admin.html
   * TODO(client): change this before going live. This is a PLACEHOLDER.
   * ------------------------------------------------------------------*/
  adminPassword: 'CHANGE-ME-auve-admin',

  /* ------------------------------------------------------------------
   * RAZORPAY (online payments: UPI / cards / net banking / wallets)
   * TODO(client): paste the client's Razorpay Key ID and Key Secret from
   * Razorpay Dashboard -> Settings -> API Keys (use LIVE keys to go live,
   * TEST keys while testing). While these are empty, online payment runs
   * in clearly labelled TEST mode and orders are saved as pay-on-delivery.
   * ------------------------------------------------------------------*/
  razorpay: {
    keyId: '',     // e.g. 'rzp_live_xxxxxxxxxxxx'  (TODO(client))
    keySecret: ''  // kept server-side only          (TODO(client))
  },

  /* ------------------------------------------------------------------
   * SHIPROCKET (shipping / AWB / tracking)
   * TODO(client): the client's Shiprocket account email + password
   * (app.shiprocket.in). While empty, shipment creation is skipped and
   * orders are saved without an AWB.
   * pickupLocation: the pickup address nickname registered in Shiprocket.
   * ------------------------------------------------------------------*/
  shiprocket: {
    email: '',            // TODO(client)
    password: '',         // TODO(client)
    pickupLocation: 'Primary'
  }
};
