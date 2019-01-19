'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const request = require('supertest');

const expect = chai.expect;

const { Book } = require('../models/book');

const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

function generateUserData() {
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: "password123"
    }
}

describe("Book test server", function () {
    before(function () {
        return runServer(TEST_DATABASE_URL)
    });
    after(function () {
        return closeServer();
    });

    it('should get an ok status', function() {
        let res;
        return request(app)
            .get('/book')
            .then(function (_res) {
                res = _res;
                expect(res).to.have.status(200)
            })
    })
    it('should add a book to Book database', function(done){
        const newBook = {
            title: "Dune",
            author: "Frank Herbert"
        }
        request(app)
            .post('/book')
            .type('form')
            .send(newBook)
            .expect(201)
            .end(done)
    })

        describe("POST to register", function () {
        it("should create a new User", function (done) {
            const newUser = generateUserData();

            request(app)
            .post('/register')
            .type('form')
            .send(newUser)
            .expect(201)
            .end(done)
        })
    })
})