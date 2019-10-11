//function to handle xhr response
const handleResponse = (xhr, parseResponse) => {
    //grab the content section
    const content = document.querySelector("#content");
    //clear the content section
    content.innerHTML = "";
    let row = document.createElement("div");
    row.className = "row";
    //apply text to the h1 based on the status code
    let headerCol = document.createElement("div");
    headerCol.className = "col-12";
    let status = document.createElement("h2");
    switch(xhr.status) {
        case 200: //success
            status.textContent = `Success`;
            break;
        case 201: //created
            status.textContent = `Created`;
            break;
        case 204: //updated
            status.textContent = `Updated`;
            break;
        case 400: //bad request 
            status.textContent = `Bad Request`;
            break;
        case 401: //unauthorized 
            status.textContent = `Unauthorized`;
            break;
        case 403: //forbidden 
            status.textContent = `Forbidden`;
            break;
        case 404: //not found (requested resource does not exist)
            status.textContent = `Resource Not Found`;
            break;
        case 500: //internal server error
            status.textContent = `Internal Server Error`;
            break;
        case 501: //not implemented
            status.textContent = `Not Implemented`;
            break;
        default: //default other errors we are not handling in this example
            status.textContent = `Error code not implemented by client.`;
            break;
    }
    headerCol.appendChild(status);
    row.appendChild(headerCol);
    content.innerHTML += `</div>`;
    let contentCol = document.createElement("div");
    contentCol.className = "col-12";
    //parse response if the request asked to do so and info isn't just being updated
    if(parseResponse && xhr.status !== 204){
        const obj = JSON.parse(xhr.response);
        console.log(obj);
        //if message in response, add to screen
        if(obj.message) {
            contentCol.innerHTML += `<p>Message: ${obj.message}</p>`;
        }
        //if issues in response, add to screen
        if(obj.issues) {
            for(let i in obj.issues){
                let card = document.createElement("div");
                card.className = "card";
                card.style.width = "18rem";
                let cardHeader = document.createElement("div");
                cardHeader.className = "card-header";
                cardHeader.innerHTML += `<b>${i.id}:</b> ${i.issue}`;
                card.appendChild(cardHeader);
                console.log(i);
                console.log(i[comments]);
                let issueComment = i.comments;
                if(issueComment.length > 0){
                    let commentList = document.createElement("ul");
                    commentList.className = "list-group list-group-flush";
                    for(let c of i.comments){
                        let comment = document.createElement("li");
                        comment.className = "list-group-item";
                        comment.innerHTML += `${c}`;
                        commentList.appendChild(comment);
                    }
                }
                contentCol.appendChild(card);
            }
        }
        //if a single issue in response, add it to the screen with the comment form
        if(obj.singleIssue) {
            let card = document.createElement("div");
            card.className = "card";
            card.style.width = "18rem";
            let cardHeader = document.createElement("div");
            cardHeader.className = "card-header";
            cardHeader.innerHTML += `<b>${obj.singleIssue.id}:</b> ${obj.singleIssue.issue}`;
            card.appendChild(cardHeader);
            let issueComment = obj.singleIssue.comments;
            if(issueComment.length > 0){
                let commentList = document.createElement("ul");
                commentList.className = "list-group list-group-flush";
                for(let c of obj.singleIssue.comments){
                    let comment = document.createElement("li");
                    comment.className = "list-group-item";
                    comment.innerHTML += `${c}`;
                    commentList.appendChild(comment);
                }
            }
            contentCol.appendChild(card);
        }
    } else { // default message
        contentCol.innerHTML = '<p>(No Content)</p>';
    }
    row.appendChild(contentCol);
    content.appendChild(row);
};

//function to send request to server
const requestUpdate = (e, form) => {
    //get the action (url) and method (request type) from passed form
    let formAction = form.getAttribute('action');
    let formMethod = form.getAttribute('method');

    //handle case of the url needing an added id query string
    if(form.querySelector("#idField")){
        formAction+=`?id=${form.querySelector("#idField").value}`;
    }

    //open a new xmlhttprequest based on passed form action/method
    const xhr = new XMLHttpRequest();
    xhr.open(formMethod, formAction);
    //when a response is recieved call the handleResponse function
    if(formMethod === "head"){
        xhr.onload = () => handleResponse(xhr, false);
    } else {
        xhr.onload = () => handleResponse(xhr, true);
    }
    //handle a post request
    if(formMethod === "post") {
        if(formAction === "/addIssue"){ //posting an issue
            //get the issue to pass to the server
            const issueField = form.querySelector('#issueField');
            //type used when parsing url query strings
            xhr.setRequestHeader('Content-type', 'applications/x-www-form-urlencoded');

            //send an ajax request with the parsed form data
            const formData = `issue=${issueField.value}`;
            xhr.send(formData);
        } else { //posting a comment
            //get the issue to pass to the server
            const commentField = form.querySelector('#commentField');
            //type used when parsing url query strings
            xhr.setRequestHeader('Content-type', 'applications/x-www-form-urlencoded');

            //send an ajax request with the parsed form data
            const formData = `comment=${commentField.value}`;
            xhr.send(formData);
        }
    } else { //handle get or head requests
        //send basic ajax request
        xhr.send();
    }
    //prevent the browser's default action (to send the form on its own)
    e.preventDefault();
    //return false to prevent the browser from trying to change page
    return false;
};

const init = () => {
    //grab the relevent items from the page and start listening to them
    const issueForm = document.querySelector("#issueForm");
    const issueViewer = document.querySelector("#viewIssues");
    const commentForm = document.querySelector("#commentForm");
    //functions to handle our requests
    const sendIssue = (e) => requestUpdate(e, issueForm);
    const getIssue = (e) => requestUpdate(e, issueViewer);
    const updateComments = (e) => requestUpdate(e, commentForm);
    //add event listeners to the send buttons
    if(issueForm){
        issueForm.addEventListener('submit', sendIssue);
    }
    if(issueViewer){
        issueViewer.addEventListener('submit', getIssue);
    }
    if(commentForm){
        commentForm.addEventListener('submit', updateComments);
    }
};
//load the init function when the page loads
window.onload = init;