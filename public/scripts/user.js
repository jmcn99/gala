function follow(dat) {
    let id = dat.id;

    // Make put request to server
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // If successful, change button to unfollow
            let btn = document.getElementById("follow");
            btn.innerHTML = "unfollow";
            btn.setAttribute("onclick", `unfollow(${JSON.stringify(dat)})`);
        }
    }
    xhttp.open("PUT", "/user/follow/" + id, true);
    xhttp.send();
}

function unfollow(dat) {
    let id = dat.id;

    // Make put request to server
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // If successful, change button to follow
            let btn = document.getElementById("follow");
            btn.innerHTML = "follow";
            btn.setAttribute("onclick", `follow(${JSON.stringify(dat)})`);
        }
    }
    xhttp.open("PUT", "/user/unfollow/" + id, true);
    xhttp.send();
}

function artistToggle() {
    let btn = document.getElementById("artist");
    if(btn.innerHTML == "become artist") {

        if(!confirm("You are now an artist. Would you like to upload an image?")) {
            return;               
        }
    }
    // Create put request
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // If successful, change button to artist
            console.log()
            if (btn.innerHTML === "become patron") {
                btn.innerHTML = "become artist";
            } else {
                
                btn.innerHTML = "become patron";
                window.location.href = "/gallery/upload";
            }
        }
    }
    xhttp.open("PUT", "/user/artist", true);
    xhttp.send();
}

// Function to handle joining workshop
function toggleWorkshop(dat) {
    console.log(dat);
    // Make put request to server
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // If successful, change button to leave
            //reload window
            window.location.reload();
            // let btn = document.getElementById("joinBtn");
            // if(btn.innerHTML === "leave") {
            //     btn.innerHTML = "join";
            // } else {
            //     btn.innerHTML = "leave";
            // }
        }
    
    }
    xhttp.open("PUT", "/workshop/toggle/" + dat, true);
    xhttp.send();
}