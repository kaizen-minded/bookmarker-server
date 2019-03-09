'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { Book } = require('../models/book');
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

    beforeEach(function (done) {

        newUser = generateUserData();
        request(app)
            .post('/register')
            .set('Accept', 'application/json')
            .send(newUser)
            .expect(201)
            .then((res) => {
                newUser.id = res.body.id;
                return Book.create({
                    userId: res.body.id,
                    bookId: 2134,
                    title: "Harry Potter"
                })
            })
            .then((res) => {
                done()
            })
    });

    afterEach(function () {
        return tearDownDb();
    });
    describe('/book', function () {
        it('Should send protected data', function () {
            const token = jwt.sign(
                {
                    user: {
                        username: newUser.username,
                        id: newUser.id,
                        firstName: newUser.firstName,
                        lastName: newUser.lastName
                    }
                },
                JWT_SECRET,
                {
                    algorithm: 'HS256',
                    subject: newUser.username,
                    expiresIn: '7d'
                }
            );

            return chai
                .request(app)
                .get('/book?status=wishlist')
                .set('authorization', `Bearer ${token}`)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body[0]).to.be.an('object');
                });
        });
    });
    it('Should add new book', function () {
        const token = jwt.sign(
            {
                user: {
                    username: newUser.username,
                    id: newUser.id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName
                }
            },
            JWT_SECRET,
            {
                algorithm: 'HS256',
                subject: newUser.username,
                expiresIn: '7d'
            }
        );

        return chai
            .request(app)
            .post('/book/create')
            .set('authorization', `Bearer ${token}`)
            .send({userId: newUser.id, title: "Lord of the rings"})
            .then(res => {
                expect(res).to.have.status(201);
                expect(res.body).to.be.an('object');
                expect(res.body.title).to.equal("Lord of the rings");
                expect(res.body.status).to.equal("wishlist");
            });
    });

    it('Should delete book', function () {
        const token = jwt.sign(
            {
                user: {
                    username: newUser.username,
                    id: newUser.id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName
                }
            },
            JWT_SECRET,
            {
                algorithm: 'HS256',
                subject: newUser.username,
                expiresIn: '7d'
            }
        );
        return chai
            .request(app)
            .post('/book/create')
            .set('authorization', `Bearer ${token}`)
            .send({userId: newUser.id, title: "Lord of the rings", bookId: 123887})
            .then(res => {
                return chai
                    .request(app)
                    .delete(`/book/deletebook/${res.body.bookId}`)
                    .set('authorization', `Bearer ${token}`)
                    .then(res => {
                        expect(res).to.have.status(201);
                        expect(res.body).to.be.an('object');
                        expect(res.body.title).to.equal("Lord of the rings");
                        expect(res.body.status).to.equal("wishlist");
                    });
            });
    }); 
});
