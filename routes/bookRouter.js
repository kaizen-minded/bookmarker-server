const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const convert = require('xml-js');
const API_KEY = require('../config').GOODREADS_API_KEY;

const { Book } = require("../models/book");

router.get('/', (req, res) => {
    const status = req.query.status
    Book.find({status: status, userId: req.user.id})
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        })
})

router.get('/allbooks', (req, res) => {
    Book.find({ userId: req.user.id})
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        })
})

router.get('/:id', (req, res) => {
    const id = req.params.id
    Book.findOne({bookId: id, userId: req.user.id})
        .then(data => {
            res.json(data)
        })
        .catch(err => {
            res.json(err)
        })
})

router.get('/search/:id', (req,res) => {
    const query ={
        q: req.params.id,
        key: API_KEY
    }
    fetch(`https://www.goodreads.com/search/index.xml?q=${query.q}&key=${query.key}`)
    .then(res => {
        if(!res.ok) {
            return Promise.reject(res.statusText);
        }
        return res.text()
    })
    .then(xmlText => convert.xml2json(xmlText, {compact: true, trim: true}))
    .then(data => {
        let object = JSON.parse(data)
        res.json(object.GoodreadsResponse.search.results.work)})
    .catch(err => {
        res.json(err)
    })

})

router.post('/create', (req, res) => {
    Book.create({
        userId: req.user.id,
        title: req.body.title,
        author: req.body.author,
        bookId: req.body.bookId,
        status: req.body.status,
        bookCover: req.body.bookCover,
    })
        .then(book => {
            res.status(201).json(book.serialize());
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" })
        })
})

router.put('/updatebookstatus/:id', (req, res) => {
    const id = {bookId: req.body.id, userId: req.user.id}
    Book.findOneAndUpdate(id, {status: req.body.status}, {new: true})
    .then(book => {
        res.status(201).json({message: book});
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" })
    })
})

router.delete('/deletebook/:id', (req, res) =>{
    Book.findOneAndDelete({
        userId: req.user.id,
        bookId: req.params.id
    })
    .then(book => res.status(201).json(book)) 
    .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" })
        })
})

router.post('/addcomment/:id', (req, res) => {
    Book.findOneAndUpdate({
        userId: req.user.id,
        bookId: req.params.id
    },
        {
            $push: {
                notes: {
                    $each:[
                        {
                            currentPage: req.body.bookmarkPage,
                            body: req.body.comment
                        }],
                    $position: 0
                }
            }
        }, {new: true})
        .then(result => {
            res.status(200).json({commentInfo: result.notes[0]})
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" })
        })

})
router.delete('/deletecomment/:id', (req, res) => {
    Book.findOneAndUpdate({
        userId: req.user.id,
        bookId: req.params.id
    },
        {
            $pull: {
                notes: {_id: req.body.commentId }
            }
        }, {new: true})
        .then(result => {
            res.status(200).json({commentInfo: result})          
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" })
        })
})

module.exports = router;