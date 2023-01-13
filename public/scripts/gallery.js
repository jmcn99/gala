function genModal(dat, id) {
    console.log(dat);

    let modal = document.getElementById("img-modal");
    let close = document.getElementById("close");
    modal.style.display = "block";

    let modalBody = document.getElementById("modal-body");
    modalBody.innerHTML = "";
    modalBody.innerHTML += `<img src="${dat.image}" alt="${dat.name}" class="modal-img">`;

    let modalFooter = document.getElementById("modal-footer");
    modalFooter.innerHTML = "";
    modalFooter.innerHTML +=`<p>${dat.description}</p>`;
    let modalLikes = document.getElementById("modal-likes");
    modalLikes.innerHTML = "";
    let likeButton = document.createElement("span");
    likeButton.setAttribute("class", "material-symbols-outlined");
    likeButton.setAttribute("style", "display:inline;");
    likeButton.innerHTML = "favorite";
    modalLikes.appendChild(likeButton);
    likeButton.setAttribute("id", "like-button");

    

    modalLikes.onclick = function() {
        toggleLike(dat);
    }
    
    modalLikes.innerHTML += `<p style="display:inline;">${dat.likes.length}</p>`;


    let modalReviewList = document.getElementById("modal-reviews");
    modalReviewList.innerHTML = "";
    for(let rev in dat.reviews) {
        let reviewDiv = document.createElement("div");
        if(dat.reviews[rev].userId == id) {
            
            reviewDiv.innerHTML += `<button id="del-review">X</button><p class="review"> ${dat.reviews[rev].username}: ${dat.reviews[rev].review}</p>`;
            // Add event listener to delete button to delete review
                    // Add class review div to reviewDiv
            reviewDiv.classList.add("review-div");
            modalReviewList.appendChild(reviewDiv);
            document.getElementById("del-review").onclick = function() {
                deleteReview(dat, dat.reviews[rev].review);
            }            
        } else {
            reviewDiv.innerHTML += `<p class="review"> ${dat.reviews[rev].username}: ${dat.reviews[rev].review}</p>`;
            // Add class review div to reviewDiv
            reviewDiv.classList.add("review-div");
            modalReviewList.appendChild(reviewDiv);
        }
        



    }
    

    let modalReviewForm = document.getElementById("modal-new-review");
    modalReviewForm.innerHTML = "";
    modalReviewForm.innerHTML += `<input type="text" id="review-message" name="review" placeholder="leave new review">`;
    modalReviewForm.innerHTML += `<button id="post-review" type="button">post</button>`;
    let postReview = document.getElementById("post-review");
    postReview.onclick = function() {
        newReview(dat);
    }




    let modalHeader = document.getElementById("modal-header");
    modalHeader.innerHTML = "";

    let messageDiv = document.createElement("div");
    modalHeader.innerHTML += `<h2>${dat.name}</h2>`;
    let message = document.createElement("p")
    message.innerHTML += `${dat.year} | ${dat.category} | `
    let artist = document.createElement("a");
    artist.innerHTML = dat.artist;
    artist.href = "/user/" + dat.userId;

    modalHeader.appendChild(messageDiv);
    messageDiv.appendChild(message);
    message.appendChild(artist);

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    close.onclick = function() {
        modal.style.display = "none";
    }
}

function upload() {
    let imgIn = document.getElementById("image");
    let nameIn = document.getElementById("name");
    let yearIn = document.getElementById("year");
    let categoryIn = document.getElementById("category");
    let descIn = document.getElementById("description");

    let img = imgIn.value;
    let name = nameIn.value;
    let year = yearIn.value;
    let category = categoryIn.value;
    let description = descIn.value;

    let data = {img: img, name: name, year: year, category: category, description: description};

    // loop through all keys in data
    // if any are empty, return false
    for (let key in data) {
        if (data[key] == "") {
            alert("Please fill out all fields");
            return;
        }
    }

    // if all fields are filled out, send data to server
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            alert("Image uploaded successfully");
            window.location.reload();
        }
    }
    xhttp.open("POST", "/gallery/upload", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(data));
}

function toggleLike(dat) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.location.reload();
        }
    }
    xhttp.open("PUT", "/gallery/like/" + dat._id.toString(), true);
    xhttp.send();
}

// Function to handle on click event for posting a review
function newReview(dat) {
    // Set up data
    let review = document.getElementById("review-message").value;
    console.log(JSON.stringify(dat));

    let data = {review: review, id: dat._id.toString(), userId: dat.userId};
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.location.reload();
        }
    }
    xhttp.open("POST", "/gallery/review", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    xhttp.send(JSON.stringify(data));
}

// Function to handle deleting a review
function deleteReview(dat, rev) {
    let data = {id: dat._id.toString(), review: rev};
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.location.reload();
        }
    }
    xhttp.open("PUT", "/gallery/review", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(data));
}

// Function to send a request to create a workshop
function createWorkshop(dat) {
    let name = document.getElementById("name").value;
    let description = document.getElementById("description").value;

    let data = {name: name, description: description};

    // loop through all keys in data
    // if any are empty, return false
    for (let key in data) {
        if (data[key] == "") {
            alert("Please fill out all fields");
            return;
        }
    }

    // if all fields are filled out, send data to server
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Workshop created successfully");
            window.location.reload();
        }
    }
    xhttp.open("POST", "/workshop/createworkshop", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(data));
}
