function showTime() {
    let time = new Date();
    const actualTime = time.toLocaleTimeString('en', {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'});
    document.getElementById("time").innerHTML = actualTime;
}

window.onload = function() {
    showTime();
    setInterval(showTime, 1000);
    checkLoginStatus();
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {logoutButton.addEventListener('click', handleLogout);}
}

function handleLogout() {
    fetch('/logout', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.removeItem('username');
            checkLoginStatus();
            alert(data.message);
        } else {alert('Logout failed');}
    });
}

function checkLoginStatus() {
    fetch('/login-status', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('petForm').classList.remove('hidden');
        } else {
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('petForm').classList.add('hidden');
        }
    });
}

function submitLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {checkLoginStatus(); alert("Login successful!");} 
        else {document.getElementById('loginError').innerText = data.message;}
    });
}


function submitCreateAccount(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/create-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('createAccountMessage').innerText = 'Account created successfully.';
            } else {
                document.getElementById('createAccountMessage').innerText = data.message;
            }
        });
}



function submitFind(event)   {
    event.preventDefault();
    let errorMsg = "error...please enter one or more valid inputs";
    let error = false;

    if (!document.querySelector('input[name="cat/dog"]:checked'))   {error = true;}
    else if (!document.querySelector('input[name="breed"]:checked'))   {error = true;}
    else if (document.getElementById("age").value === "") {error = true;}
    else if (!document.querySelector('input[name="gender"]:checked'))    {error = true;}
    else if (!document.querySelector('input[name="get-along1"]:checked'))   {error = true;}

    if (error)  {alert(errorMsg);}  
    else {
        // Filter and display matching pets
        const petCriteria = {
            type: document.querySelector('input[name="cat/dog"]:checked').value,
            breed: document.querySelector('input[name="breed"]:checked').value,
            age: document.getElementById("age").value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            getAlong: document.querySelector('input[name="get-along1"]:checked').value
        };

        const allPets = [
            {
                img: "/images/pet1.jpg",
                name: "Bella",
                type: "dog",
                breed: ["breed-of-dog", "none-breed"],
                age: ["less-than-5", 2],
                gender: ["female", "none-gender"],
                getAlong: ["other-dogs", "other-cats", "small-children"],
                description: "Bella is a friendly and energetic dog who loves to play fetch and go on long walks."
            },
            {
                img: "/images/pet2.jpg",
                name: "Max",
                type: "dog",
                breed: ["breed-of-dog", "none-breed"],
                age: ["5-9", 7],
                gender: ["male", "none-gender"],
                getAlong: ["other-dogs", "small-children"],
                description: "Max is a loyal and protective dog who would be a great companion for an active family."
            },
            {
                img: "/images/pet3.jpg",
                name: "Luna",
                type: "cat",
                breed: ["breed-of-cat", "none-breed"],
                age: ["less-than-5", 3],
                gender: ["female", "none-gender"],
                getAlong: ["other-cats"],
                description: "Luna is a curious and playful cat who enjoys climbing and exploring her surroundings."
            }
        ];

        const matchingPets = allPets.filter(pet => {
            return (petCriteria.type === 'none' || pet.type.includes(petCriteria.type)) &&
                (petCriteria.breed === 'none' || pet.breed.includes(petCriteria.breed)) &&
                (petCriteria.age === 'none' || pet.age.includes(petCriteria.age)) &&
                (petCriteria.gender === 'none' || pet.gender.includes(petCriteria.gender)) &&
                (petCriteria.getAlong === 'none' || pet.getAlong.includes(petCriteria.getAlong));
        });

        const resultContent = document.getElementById("resultContent");
        resultContent.innerHTML = '<h2>Results:</h2><br>';

        matchingPets.forEach(pet => {
            const petDiv = document.createElement('div');
            petDiv.classList.add('pet');
            petDiv.innerHTML = `
                <style> strong {color: #30871b;} </style>
                <img src="${pet.img}" alt="available pet">
                <div class="pet-info">
                    <h3>${pet.name}</h3>
                    <p><strong>Breed: </strong> ${pet.breed[0]}</p>
                    <p><strong>Age: </strong> ${pet.age[1]} year(s) old</p>
                    <p><strong>Gender: </strong> ${pet.gender[0]}</p>
                    <p><strong>Gets along with: </strong> ${pet.getAlong.join(', ')}</p>
                    <p>${pet.description}</p><br>
                    <button type="button" onclick="interested(event)">Interested</button>
                </div>
            `;
            resultContent.appendChild(petDiv);
        });
        document.getElementById("resultContent").classList.remove("hidden");
    };
}

function interested(event)  {
    event.preventDefault();
    alert("Interest reveived and saved!");
}

function submitGiveAway(event) {
    event.preventDefault();
    let errorMsg = "error...please enter one or more valid inputs";
    let error = false;

    let email = document.getElementById("email").value;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!document.querySelector('input[name="cat/dog"]:checked')) { error = true; }
    else if (!document.querySelector('input[name="breed"]:checked')) { error = true; }
    else if (document.getElementById("age").value === "") { error = true; }
    else if (!document.querySelector('input[name="gender"]:checked')) { error = true; }
    else if (!document.querySelector('input[name="get-along1"]:checked')) { error = true; }
    else if (!document.querySelector('input[name="get-along2"]:checked')) { error = true; }
    else if (document.getElementById("brag").value === "") { error = true; }
    else if (document.getElementById("name").value === "") { error = true; }
    else if (!emailPattern.test(email)) { error = true; }

    if (error) {alert(errorMsg);} 
    else {
        const petDetails = {
            username: document.getElementById("username").value,
            animalType: document.querySelector('input[name="cat/dog"]:checked').value,
            breed: document.querySelector('input[name="breed"]:checked').value,
            age: document.getElementById("age").value,
            gender: document.querySelector('input[name="gender"]:checked').value,
            getAlong1: document.querySelector('input[name="get-along1"]:checked') ? document.querySelector('input[name="get-along1"]:checked').value : '',
            getAlong2: document.querySelector('input[name="get-along2"]:checked').value,
            brag: document.getElementById("brag").value,
            name: document.getElementById("name").value,
            email: document.getElementById("email").value
        };

        fetch('/submit-pet', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(petDetails)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {alert('Pet registered successfully.');} 
            else {alert('Failed to register pet.');}
        });
    }
}

fetch('/header.html')
{
    document.getElementById('side-menu-placeholder').innerHTML = document.querySelector('.side-menu').outerHTML;
    document.querySelector('.side-menu').remove();
};

