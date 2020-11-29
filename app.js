const express = require('express');
const expressHbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');

const usersPath = path.join(process.cwd(), './users.json');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'views')));

app.set('view engine', '.hbs');
app.engine('.hbs', expressHbs({ defaultLayout: false }));
app.set('views', path.join(process.cwd(), 'views'));



let isUserLog = false;
let errorMsg = 'Try again';

// MAIN

app.get('/', ((req, res) => {
    res.render('main');
}));

// USERS

app.get('/users', (req, res) => {

    if (!isUserLog) {
        errorMsg = 'Please login';
        res.redirect('/error');
    }

    fs.readFile(usersPath, (err, data) => {

        if (err) {
            errorMsg = 'Try again';
            res.render('error');
            return
        }

        const users = JSON.parse(data.toString());
        res.render('users', { users });
    });
});

// REGISTER

app.get('/registration', ((req, res) => {
    res.render('registration');
}));

app.post('/registration', ((req, res) => {
    const { userName, email } = req.body;

    fs.readFile(usersPath, ((err, data) => {

        if(err){
            errorMsg = 'Try again';
            res.render('error');
            return
        }

        const users = JSON.parse(data.toString());
        const isUserExist = users.find((user) => user.email === email && user.userName === userName);

        if (!isUserExist) {
            users.push(req.body);
            fs.writeFile(usersPath, JSON.stringify(users), (err1) => {

                if (err1){
                    res.render('error');
                }
            });

            isUserLog = true;
            res.redirect('/users');
            return
         }

        errorMsg = 'User already exists';
        res.redirect('/error');
    }
    ));
  }
));

// LOGIN

app.get('/login', ((req, res) => {
    res.render('login');
}));

app.post('/login', ((req, res) => {
    const { email, password } = req.body;

    fs.readFile(usersPath, ((err, data) => {

        if (err) {
            errorMsg = 'Try again';
            res.render('error');
            return
        }

        const users = JSON.parse(data.toString());
        const isUserReg = users.find(u => u.email === email && u.password === password);

        if (!isUserReg) {
            errorMsg = 'User is not found. Please register';
            res.redirect('/error');
            return
        }

        isUserLog = true;
        res.redirect('/users');
     }
    ));
  }
));

// LOGOUT

app.post('/logout', (req, res) => {
    isUserLog = false;
    res.redirect('/login');
});

// ERROR

app.get('/error', (req, res) => {
    res.render('error', { message: errorMsg });
});


app.listen(5000, () => {
    //console.log('App listen 5000');
});

