const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ejs = require('ejs');

const { Challenge } = require("../models/challenge");


router.get('/:id', (req, res) => {
    Challenge.find({
        userId: req.user.id
    })
        .then(data => {
            const username = req.user.username;
            let options;
            if (data.length < 1) {
                options = { hasChallenge: false, username, loggedIn: true }

            }

            else {
                const username = req.user.username;
                let totalTask = data.reduce((a, v) => {
                    if (typeof a === 'object') return a.tasks.length + v.tasks.length;
                    else return a + v.tasks.length
                })

                let completedTask = data.reduce((a, v) => {
                    if (typeof a === 'object') return a.tasks.filter(t => t.completed).length + v.tasks.filter(t => t.completed).length;
                    else return a + v.tasks.filter(t => t.completed).length
                });

                if (data.length === 1) {
                    totalTask = data[0].tasks.length;
                    completedTask = data[0].tasks.filter(t => t.completed).length
                }

                const progressBar = [];
                data.forEach(challenge => {
                    let allTask = challenge.tasks.length;
                    let jobDone = challenge.tasks.filter(task => task.completed).length;
                    let progress = jobDone / allTask * 100;
                    progressBar.push([jobDone, allTask]);
                })
                options = { hasChallenge: true, data, username, progressBar, totalTask, completedTask, loggedIn: true }
            }
            ejs.renderFile('views/profile.ejs', options, { cache: true }, function (err, str) {
                if (str) {
                    res.send(str)
                } else {
                    throw err;
                }
            })

        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" })
        })
});



router.post('/addchallenge', (req, res) => {
    Challenge.create({
        userId: mongoose.Types.ObjectId(req.user.id),
        name: req.body.name,
        startDate: req.body.startDate,
        deadline: req.body.deadline
    })
        .then(challenge => {
            res.redirect(`/challenges/${req.user.id}`);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" })
        })
})

router.delete('/deletechallenge/:id', (req, res) => {
    Challenge.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id
    })
        .then(element => { res.redirect(`/challenges/task/${req.params.id}`) })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" })
        })
})

router.get('/task/:id', (req, res) => {
    Challenge.find({
        userId: req.user.id

    })
        .then(allChallenges => {
            challenge = allChallenges.find(c => c._id.toString() === req.params.id)
            let options = {
                challenge: challenge,
                allChallenges: allChallenges,
                loggedIn: true
            }
            ejs.renderFile('views/task.ejs', options, { cache: true }, function (err, str) {
                if (str) {
                    res.send(str)
                } else {
                    throw err;
                }
            })
        });
});


router.post('/addtask/:id', (req, res) => {
    Challenge.findOneAndUpdate({
        userId: req.user.id,
        _id: req.params.id
    },
        {
            $push: {
                tasks: {
                    name: req.body.name,
                    startDate: req.body.startDate,
                    deadline: req.body.deadline
                }
            }
        })
        .then(challenge => {
            res.redirect(`/challenges/task/${req.params.id}`)
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" })
        })

})

router.delete('/deletetask/:id', (req, res) => {
    let deletetask = req.params.id;
    Challenge.findOneAndUpdate(
        { 'tasks._id': deletetask }
        , { $pull: { tasks: { _id: deletetask } } }
    )
        .then(newArray => {
            res.redirect(`/challenges/task/${req.params.id}`)
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" })
        })
})

router.put('/completedTask/:id', (req, res) => {
    let task = req.params.id;
    Challenge.findOneAndUpdate(
        { 'tasks._id': task },
        { $set: { 'tasks.$.completed': req.body.completed } },
    )
        .then(element => {
            res.json(element)
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" })
        })
});



module.exports = router;