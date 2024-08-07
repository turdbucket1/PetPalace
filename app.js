const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const session = require('express-session');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Serve header and footer files directly
app.get('/header.html', (req, res) => {res.sendFile(path.join(__dirname, 'views', 'header.html'));});

app.get('/footer.html', (req, res) => {res.sendFile(path.join(__dirname, 'views', 'footer.html'));});

// Function to include header and footer
function includeHeaderFooter(contentFilePath, res) {
    const headerPath = path.join(__dirname, 'views', 'header.html');
    const footerPath = path.join(__dirname, 'views', 'footer.html');
    const contentPath = path.join(__dirname, 'views', contentFilePath);

    const header = fs.readFileSync(headerPath, 'utf8');
    const footer = fs.readFileSync(footerPath, 'utf8');
    const content = fs.readFileSync(contentPath, 'utf8');

    res.send(header + content + footer);
}

app.get('/', (req, res) => {includeHeaderFooter('home.html', res);});

app.get('/find', (req, res) => {includeHeaderFooter('find.html', res);});

app.get('/dog-care', (req, res) => {includeHeaderFooter('dog-care.html', res);});

app.get('/cat-care', (req, res) => {includeHeaderFooter('cat-care.html', res);});

app.get('/give-away', (req, res) => {includeHeaderFooter('give-away.html', res);});

app.get('/contact', (req, res) => {includeHeaderFooter('contact.html', res);});

app.get('/privacy', (req, res) => {includeHeaderFooter('privacy.html', res);});

app.get('/create-account', (req, res) => {includeHeaderFooter('create-account.html', res);});


app.post('/create-account', (req, res) => {
    const { username, password } = req.body;

    if (!/^[a-zA-Z0-9]+$/.test(username) || !/^(?=.*[a-zA-Z])(?=.*[0-9]).{4,}$/.test(password)) {
        res.json({ success: false, message: 'Invalid username or password format.' });
        return;
    }

    fs.readFile('./data/users.txt', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Internal server error' });
            return;
        }

        const users = data.split('\n').map(line => line.split(':')[0]);
        if (users.includes(username)) {
            res.json({ success: false, message: 'Username already exists.' });
            return;
        }

        fs.appendFile('./data/users.txt', `${username}:${password}\n`, (err) => {
            if (err) {
                res.status(500).json({ success: false, message: 'Internal server error' });
                return;
            }
            res.json({ success: true, message: 'Account created successfully.' });
        });
    });
});



app.post('/login', (req, res) => {
    const { username, password } = req.body;
    fs.readFile('./data/users.txt', 'utf8', (err, data) => {
        if (err) {res.status(500).json({ success: false, message: 'Internal server error' });   return;}
        const users = data.split('\n').map(line => line.split(':'));
        const user = users.find(user => user[0] === username && user[1] === password);
        if (!user) {res.json({ success: false, message: 'Invalid login.' });    return;}
        req.session.username = username;
        res.json({ success: true });
    });
});

app.post('/submit-pet', (req, res) => {
    const { username, animalType, breed, age, gender, getAlong1, getAlong2, brag, name, email } = req.body;
    fs.readFile('./data/pets.txt', 'utf8', (err, data) => {
        if (err) {res.status(500).json({ success: false, message: 'Internal server error' });   return;}
        const pets = data.split('\n').filter(line => line).map(line => line.split(':'));
        const id = pets.length ? parseInt(pets[pets.length - 1][0]) + 1 : 1;
        const pet = `${id}:${username}:${animalType}:${breed}:${age}:${gender}:${getAlong1},${getAlong2}:${brag}:${name}:${email}\n`;
        fs.appendFile('./data/pets.txt', pet, (err) => {
            if (err) {res.status(500).json({ success: false, message: 'Internal server error' });   return;}
            res.json({ success: true });
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {res.status(500).json({ success: false, message: 'Logout failed' });   return;}
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.get('/login-status', (req, res) => {
    if (req.session.username) {res.json({ loggedIn: true, username: req.session.username });} 
    else {res.json({ loggedIn: false });}
});

app.listen(3000, () => {console.log('Server is running on http://localhost:3000');});
