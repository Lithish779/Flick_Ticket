// Vercel Serverless Function entry point for FlickTicket Express API
process.env.VERCEL = "1";
const app = require("../server/server");

module.exports = app;
