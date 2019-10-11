"use strict";

//function to handle xhr response
var handleResponse = function handleResponse(xhr, parseResponse) {
    //grab the content section
    var content = document.querySelector("#content");
    //clear the content section
    content.innerHTML = "";
    var row = document.createElement("div");
    row.className = "row";
    //apply text to the h1 based on the status code
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
        case 401:
            //unauthorized 
            status.textContent = "Unauthorized";
            break;
        case 403:
            //forbidden 
            status.textContent = "Forbidden";
            break;
        case 404:
            //not found (requested resource does not exist)
            status.textContent = "Resource Not Found";
            break;
        case 500:
            //internal server error
            status.textContent = "Internal Server Error";
            break;
        case 501:
            //not implemented
            status.textContent = "Not Implemented";
            break;
        default:
            //default other errors we are not handling in this example
            status.textContent = "Error code not implemented by client.";
            break;
    }
    headerCol.appendChild(status);
    row.appendChild(headerCol);
    var contentCol = document.createElement("div");
    contentCol.className = "col-12";
    //parse response if the request asked to do so and info isn't just being updated
    if (parseResponse && xhr.status !== 204) {
        var obj = JSON.parse(xhr.response);
        console.log(obj);
        //if message in response, add to screen
        if (obj.message) {
            contentCol.innerHTML += "<p>Message: " + obj.message + "</p>";
        }
        //if issues in response, add to screen
        if (obj.issues) {
            for (var i in obj.issues) {
                var card = document.createElement("div");
                card.className = "card";
                card.style.width = "18rem";
                var cardHeader = document.createElement("div");
                cardHeader.className = "card-header";
                cardHeader.innerHTML += "<b>" + obj.issues[i].id + ":</b> " + obj.issues[i].issue;
                card.appendChild(cardHeader);
                var issueComments = obj.issues[i].comments;
                if (issueComments.length > 0) {
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
                            comment.innerHTML += "" + c;
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
                contentCol.appendChild(card);
            }
        }
        //if a single issue in response, add it to the screen with the comment form
        if (obj.singleIssue) {
            var _card = document.createElement("div");
            _card.className = "card";
            _card.style.width = "18rem";
            var _cardHeader = document.createElement("div");
            _cardHeader.className = "card-header";
            _cardHeader.innerHTML += "<b>" + obj.singleIssue.id + ":</b> " + obj.singleIssue.issue;
            _card.appendChild(_cardHeader);
            var issueComment = obj.singleIssue.comments;
            if (issueComment.length > 0) {
                var _commentList = document.createElement("ul");
                _commentList.className = "list-group list-group-flush";
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = issueComment[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _c = _step2.value;

                        var _comment = document.createElement("li");
                        _comment.className = "list-group-item";
                        _comment.innerHTML += "" + _c;
                        _commentList.appendChild(_comment);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
            contentCol.appendChild(_card);
        }
    } else {
        // default message
        contentCol.innerHTML = '<p>(No Content)</p>';
    }
    row.appendChild(contentCol);
    content.appendChild(row);
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
        if (formAction === "/addIssue") {
            //posting an issue
            //get the issue to pass to the server
            var issueField = form.querySelector('#issueField');
            //type used when parsing url query strings
            xhr.setRequestHeader('Content-type', 'applications/x-www-form-urlencoded');

            //send an ajax request with the parsed form data
            var formData = "issue=" + issueField.value;
            xhr.send(formData);
        } else {
            //posting a comment
            //get the issue to pass to the server
            var commentField = form.querySelector('#commentField');
            //type used when parsing url query strings
            xhr.setRequestHeader('Content-type', 'applications/x-www-form-urlencoded');

            //send an ajax request with the parsed form data
            var _formData = "comment=" + commentField.value;
            xhr.send(_formData);
        }
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
