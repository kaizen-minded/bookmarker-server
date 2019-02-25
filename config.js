"use strict";

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/bookmarker-server';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/test-bookmarker-server';
exports.PORT = process.env.PORT || 8080;
exports.GOODREADS_API_KEY = process.env.GOODREADS_API_KEY ;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';