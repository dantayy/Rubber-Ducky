"use strict";

//function to handle xhr response
var handleResponse = function handleResponse(xhr, parseResponse) {
    //grab the content section
    var content = document.querySelector("#content");
    //clear the content section
    content.innerHTML = "";
    //create h1 and p to hold our response data for the page
    var h1 = document.createElement('h1');
    var p = document.createElement('p');
    //apply text to the h1 based on the status code
    switch (xhr.status) {
        case 200:
            //success
            h1.innerHTML = "<b>Success</b>";
            break;
        case 201:
            //created
            h1.innerHTML = "<b>Created</b>";
            break;
        case 204:
            //updated
            h1.innerHTML = "<b>Updated</b>";
            break;
        case 400:
            //bad request 
            h1.innerHTML = "<b>Bad Request</b>";
            break;
        case 401:
            //unauthorized 
            h1.innerHTML = "<b>Unauthorized</b>";
            break;
        case 403:
            //forbidden 
            h1.innerHTML = "<b>Forbidden</b>";
            break;
        case 404:
            //not found (requested resource does not exist)
            h1.innerHTML = "<b>Resource Not Found</b>";
            break;
        case 500:
            //internal server error
            h1.innerHTML = "<b>Internal Server Error</b>";
            break;
        case 501:
            //not implemented
            h1.innerHTML = "<b>Not Implemented</b>";
            break;
        default:
            //default other errors we are not handling in this example
            h1.innerHTML = "<b>Error code not implemented by client.</b>";
            break;
    }
    //append the h1 to the content.
    content.appendChild(h1);
    // default message
    p.innerHTML = '(No Content)';

    //parse response if the request asked to do so and info isn't just being updated
    if (parseResponse && xhr.status !== 204) {
        var obj = JSON.parse(xhr.response);
        console.log(obj);
        //if message in response, add to screen
        if (obj.message) {
            p.innerHTML = "Message: " + obj.message;
        }
        //if issues in response, add to screen
        if (obj.issues) {
            var issues = JSON.stringify(obj.issues);
            p.innerHTML = issues;
        }
        //if a single issue in response, add it to the screen with the comment form
        if (obj.singleIssue) {
            var singleIssue = JSON.stringify(obj.singleIssue);
            p.innerHTML = singleIssue + " \n \n                <form id=\"commentForm\" action=\"/addComment\" method=\"post\" issueNum=" + singleIssue.id + ">\n                    <label for=\"comment\">Comment: </label>\n                    <textarea id=\"commentField\" type=\"text\" name=\"comment\"></textarea>\n                    <input type=\"submit\" value=\"Add Comment\" />\n                </form>";
            //have to redo the init setup each time a comment form is pulled
            //            let commentForm = document.querySelector("#commentForm");
            //            let sendComment = (e) => requestUpdate(e, commentForm);
            //            commentForm.addEventListener('submit', sendComment);
        }
    }
    //append the p to the content
    content.appendChild(p);
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

    //handle case of adding a comment
    if (form.getAttribute('issueNum')) {
        formAction += "?id=" + form.getAttribute('issueNum');
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
        //get the issue to pass to the server
        var issueField = form.querySelector('#issueField');
        //type used when parsing url query strings
        xhr.setRequestHeader('Content-type', 'applications/x-www-form-urlencoded');

        //send an ajax request with the parsed form data
        var formData = "issue=" + issueField.value;
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
    //functions to handle our requests
    var sendIssue = function sendIssue(e) {
        return requestUpdate(e, issueForm);
    };
    var getIssue = function getIssue(e) {
        return requestUpdate(e, issueViewer);
    };
    //add event listeners to the send buttons
    issueForm.addEventListener('submit', sendIssue);
    issueViewer.addEventListener('submit', getIssue);
};
//load the init function when the page loads
window.onload = init;
