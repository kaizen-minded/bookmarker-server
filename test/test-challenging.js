'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const request = require('supertest');

const expect = chai.expect;

const { Challenge } = require('../models/challenge');
const { User } = require('../models/user');
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


function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('User API resource', function () {


    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function (done){
        // return generateUserData();
        const newUser = generateUserData();

        request(app)
        .post('/register')
        .type('form')
        .send(newUser)
        .expect(201)
        .end(done)
    })

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });


    describe('GET login endpoint', function () {
        it('should get an ok status', function () {
            let res;
            return chai.request(app)
                .get('/login')
                .then(function (_res) {
                    res = _res;
                    expect(res).to.have.status(200)
                })
        })
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
    
    describe("User Login", function () {
        it("should allow the user to login", function (done) {
            
            User.findOne()
            .then((user) =>{
                request(app)
                .post('/auth/login')
                .type('form')
                .send({username: user.username, password:"password123"})
                .expect(200)
                .end(done)
            })
        })
    })
})
describe("Challenge API resources", function(){
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        User.findOne()
        .then((user) =>{
            request(app)
            .post('/auth/login')
            .type('form')
            .send({username: user.username, password:"password123"})
            .expect(200)
            .end(done)
        })

    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

})