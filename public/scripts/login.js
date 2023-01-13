

// Login function.
// Creates an xhttp request to the server with the login information. Handles if it is wrong.
// Server handles redirect if correct login
function login() {

    // Get the username and password
    let username = document.getElementById("username");
    let password = document.getElementById("password");
    password.style.border = "1px solid white";
    username.style.border = "1px solid white";
    document.getElementById("login-error").innerHTML = "";

    // Check if empty
    if(username.value === "") {
        username.style.border = "1px solid red";
    }
    if(password.value === "") {
        password.style.border = "1px solid red";
    }

    // If not empty, create the xhttp request
    if(!(username.value === "") || !(password.value === "")) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                window.location.href = "http://localhost:3000/";

            } else if (this.readyState == 4 && this.status == 401) {
                // If bad user or pass, show error

                document.getElementById("login-error").innerHTML = "Incorrect username or password";
                password.style.border = "1px solid red";
                username.style.border = "1px solid red";

            }
        };
        xhttp.open("POST", "/login", true);

        // IDK what this si but fix it
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("username=" + document.getElementById("username").value + "&password=" + document.getElementById("password").value);
    }
}

// Register function.
// Creates an xhttp request to the server with the register information. Handles if it is wrong.
// Server handles redirect if correct register
function register() {
    // Get the username and password
    let username = document.getElementById("username");
    let password = document.getElementById("password");
    password.style.border = "1px solid white";
    username.style.border = "1px solid white";
    document.getElementById("register-error").innerHTML = "";

    // Check if empty
    if(username.value === "") {
        username.style.border = "1px solid red";
    }
    if(password.value === "") {
        password.style.border = "1px solid red";
    }

    // If not empty, create the xhttp request
    if(!(username.value === "") || !(password.value === "")) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log("here");
                window.location.href = "http://localhost:3000/";
            } else if (this.readyState == 4 && this.status == 401) {
                // If bad user or pass, show error

                document.getElementById("register-error").innerHTML = "Username already exists";
                password.style.border = "1px solid red";
                username.style.border = "1px solid red";

            }
        };
        xhttp.open("POST", "/login/register", true);

        // IDK what this si but fix it
        // Nah nvm this baller for some reason
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("username=" + document.getElementById("username").value + "&password=" + document.getElementById("password").value);
    }


}