'use strict';
// global.DATABASE_URL = 'mongodb://localhost:27017/test-bookmarker-server';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../models/user');
const { JWT_SECRET } = require('../config');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

function generateUserData() {
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        password: "password123",
        email: faker.internet.email()
        
    }
};
function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
};

describe('Auth endpoints', function () {


  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  after(function () {
    return closeServer();
  });

  let newUser
  
  beforeEach(function (done){
        newUser = generateUserData();
        request(app)
        .post('/register')
        .set('Accept', 'application/json')
        .send(newUser)
        .expect(201)
        .end(done)
        });

  afterEach(function () {
    return tearDownDb();
  });

  describe('/auth/login', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .post('/auth/login')
        .then((res) =>
          expect(res).to.have.status(400)
        )
    });
    it('Should reject requests with incorrect usernames', function () {
        return chai
          .request(app)
          .post('/auth/login')
          .send({ username: 'wrongUsername', password: newUser.password })        
          .then((res) =>
            expect(res).to.have.status(401)
          )
      });
      it('Should reject requests with incorrect passwords', function () {
        return chai
          .request(app)
          .post('/auth/login')
          .send({ username: newUser.username, password: 'wrongPassword' })
          .then((res) =>
                expect(res).to.have.status(401)
          )
      });
      it('Should return a valid auth token', function () {
        return chai
          .request(app)
          .post('/auth/login')
          .send(newUser)
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            const token = res.body.authToken;
            expect(token).to.be.a('string');
            const payload = jwt.verify(token, JWT_SECRET, {
              algorithm: ['HS256']
            });
            delete newUser.password;
            delete payload.user.id;
            expect(payload.user).to.deep.equal(newUser);
          });
      });
  });
});
