"use strict";

//helper function for making cards, takes obj to make card from and page element to append to
var cardMaker = function cardMaker(obj, pageElement) {
    //assumes object is an issue
    var card = document.createElement("div");
    card.className = "card";
    //make the head of the card
    var cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    cardHeader.innerHTML += "<b>" + obj.id + ":</b> " + obj.issue;
    card.appendChild(cardHeader);
    //make the comments section of the card
    var issueComments = obj.comments;
    if (issueComments.length > 0) {
        //don't append if no comments
        var commentSectionHeader = document.createElement("div");
        commentSectionHeader.className = "card-body";
        commentSectionHeader.innerHTML = "<h5 class='card-title'>Comments</h5>";
        card.appendChild(commentSectionHeader);
        var commentList = document.createElement("ul");
        commentList.className = "list-group list-group-flush";
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = issueComments[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var c = _step.value;

                var comment = document.createElement("li");
                comment.className = "list-group-item";
                comment.innerHTML = "" + c;
                commentList.appendChild(comment);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        card.appendChild(commentList);
    }
    //append to passed page element
    pageElement.appendChild(card);
};

//function to handle xhr response
var handleResponse = function handleResponse(xhr, parseResponse) {
    //grab the content section
    var content = document.querySelector("#content");
    //clear the content section
    content.innerHTML = "";
    //create a header based on the status code
    var headerCol = document.createElement("div");
    headerCol.className = "col-12";
    var status = document.createElement("h2");
    switch (xhr.status) {
        case 200:
            //success
            status.textContent = "Success";
            break;
        case 201:
            //created
            status.textContent = "Created";
            break;
        case 204:
            //updated
            status.textContent = "Updated";
            break;
        case 400:
            //bad request 
            status.textContent = "Bad Request";
            break;
        case 404:
            //not found (requested resource does not exist)
            status.textContent = "Resource Not Found";
            break;
        default:
            //default other errors we are not handling
            status.textContent = "Status code not implemented by client.";
            break;
    }
    headerCol.appendChild(status);
    content.appendChild(headerCol);
    //create an element to display the body of the response, if there is one
    var bodyCol = document.createElement("div");
    bodyCol.className = "col-12";
    //parse response if the request asked to do so and info isn't just being updated
    if (parseResponse && xhr.status !== 204) {
        var obj = JSON.parse(xhr.response);
        console.log(obj);
        //if message in response, add to screen
        if (obj.message) {
            bodyCol.innerHTML = "<p>Message: " + obj.message + "</p>";
        }
        //if issues in response, add to created element
        if (obj.issues) {
            for (var i in obj.issues) {
                cardMaker(obj.issues[i], bodyCol);
            }
        } else if (obj.singleIssue) {
            //case of a single issue
            cardMaker(obj.singleIssue, bodyCol);
        }
    } else {
        // default message
        bodyCol.innerHTML = '<p>(No Content)</p>';
    }
    content.appendChild(bodyCol);
};

//function to send request to server
var requestUpdate = function requestUpdate(e, form) {
    //get the action (url) and method (request type) from passed form
    var formAction = form.getAttribute('action');
    var formMethod = form.getAttribute('method');

    //handle case of the url needing an added id query string
    if (form.querySelector("#idField")) {
        formAction += "?id=" + form.querySelector("#idField").value;
    }

    //open a new xmlhttprequest based on passed form action/method
    var xhr = new XMLHttpRequest();
    xhr.open(formMethod, formAction);
    //Set the accept headers to the desired response mime type
    //Server does NOT have to support this. It is a gentle request.
    xhr.setRequestHeader("Accept", 'application/json');
    //when a response is recieved call the handleResponse function
    if (formMethod === "head") {
        xhr.onload = function () {
            return handleResponse(xhr, false);
        };
    } else {
        xhr.onload = function () {
            return handleResponse(xhr, true);
        };
    }
    //handle a post request
    if (formMethod === "post") {
        //type used when parsing url query strings
        xhr.setRequestHeader('Content-type', 'applications/x-www-form-urlencoded');
        var formData = void 0;
        if (formAction === "/addIssue") {
            //posting an issue
            //get the issue to pass to the server
            var issueField = form.querySelector('#issueField');
            formData = "issue=" + issueField.value;
        } else {
            //posting a comment
            //get the comment to pass to the server
            var commentField = form.querySelector('#commentField');
            formData = "comment=" + commentField.value;
        }
        //send an ajax request with the parsed form data
        xhr.send(formData);
    } else {
        //handle get or head requests
        //send basic ajax request
        xhr.send();
    }
    //prevent the browser's default action (to send the form on its own)
    e.preventDefault();
    //return false to prevent the browser from trying to change page
    return false;
};

var init = function init() {
    //grab the relevent items from the page and start listening to them
    var issueForm = document.querySelector("#issueForm");
    var issueViewer = document.querySelector("#viewIssues");
    var commentForm = document.querySelector("#commentForm");
    //functions to handle our requests
    var sendIssue = function sendIssue(e) {
        return requestUpdate(e, issueForm);
    };
    var getIssue = function getIssue(e) {
        return requestUpdate(e, issueViewer);
    };
    var updateComments = function updateComments(e) {
        return requestUpdate(e, commentForm);
    };
    //add event listeners to the send buttons
    if (issueForm) {
        issueForm.addEventListener('submit', sendIssue);
    }
    if (issueViewer) {
        issueViewer.addEventListener('submit', getIssue);
    }
    if (commentForm) {
        commentForm.addEventListener('submit', updateComments);
    }
};
//load the init function when the page loads
window.onload = init;
