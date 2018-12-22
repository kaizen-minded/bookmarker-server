"use strict";

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/Todo-app';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/test-Todo-app';
exports.PORT = process.env.PORT || 8080;