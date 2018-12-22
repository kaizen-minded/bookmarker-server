$(document).ready(function(){
    $(".completed").click(function(e){
        let taskComplete = $(e.currentTarget).data('completed');
        let taskId = $(e.currentTarget).data('id');
        console.log({taskComplete});
        fetch(`/challenges/completedTask/${taskId}`, 
        {
            method: 'PUT',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({"completed": taskComplete})
        })
        .then(response => {
            window.location.reload()
        })
    })

    $(".delete-task").click(function(e){
        let taskId = $(e.currentTarget).data('id');
        var myRequest = new Request(`/challenges/deletetask/${taskId}`, {method: 'DELETE'});
        fetch(myRequest)
        .then(response => {
            window.location.reload()
        })
        .catch(err => {
            console.error(err);
        })
    })

    $(".delete").click(function(e){
        let taskComplete = $(e.currentTarget).data('completed');
        let challengeId = $(e.currentTarget).data('id');
        fetch(`/challenges/deletechallenge/${challengeId}`, 
        {
            method: 'DELETE'
        })
        .then(response => {
            window.location.reload()
        })
        .catch(err => {
            console.error(err);
        })
    })

    $("#login-form").submit(function(e){
        e.preventDefault();
        login($('#username').val(), $('#password').val())
    })

    $("#register-form").submit(function(e){
        e.preventDefault(); 
        fetch(`/register`, 
        {
            method: 'POST',
            body: JSON.stringify({
                username: $('#username').val(),
                password: $('#password').val(),
                email: $('#email').val(),
                firstName: $('#firstname').val(),
                lastName: $('#lastname').val()
            }),
            headers: {
                "content-type": "application/json"
            },
            credentials: "same-origin"
        })
        .then(response => {
            return window.location.href = `/login`;
        })
    })
})

function login(user, password) {
    fetch(`/auth/login`, 
        {
            method: 'POST',
            body: JSON.stringify({
                username: user,
                password: password
            }),
            headers: {
                "content-type": "application/json"
            },
            credentials: "same-origin"
        })
        .then(response => {
            return response.json()
        }).then(data => {
                localStorage.authToken = data.authToken;
                return window.location.href = `/challenges/${data.id}`
            })
            .catch(err => {
                $('#feedback').text('Wrong Username or Password');
                console.error(err);
            })
}