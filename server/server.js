// pull in http module
const http = require('http');
// url module for parsing url string
const url = require('url');
// querystring module for parsing querystrings from url
const query = require('querystring');
// pull in our custom file
const responseHandler = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// here we create a object to route our requests to the proper
// handlers. the top level object is indexed by the request
// method (get, head, etc). We can use request.method to return
// the routing object for each type of method. Once we say
// urlStruct[request.method], we recieve another object which
// routes each individual url to a handler. We can index this
// object in the same way we have used urlStruct before.
const urlStruct = {
    GET: {
        '/': responseHandler.getIndex,
        '/issues': responseHandler.getIssuePage,
        '/style.css': responseHandler.getCSS,
        '/client.js': responseHandler.getClientJs,
        '/bundle.js': responseHandler.getBundle,
        '/getIssues': responseHandler.getIssues,
        '/notReal': responseHandler.notReal,
    },
    HEAD: {
        '/notReal': responseHandler.notRealMeta,
    },
    POST: {
        '/addIssue': responseHandler.addIssue,
        '/addComment': responseHandler.addComment,
    },
};

// handle a general post request
const handlePost = (request, response, parsedUrl, params) => {
    // vars for processing data sent to server for adding an issue
    const body = [];

    // .on calls are like event listeners triggering as the users data stream is being processed
    request.on('error', (err) => {
        console.log(err);
        response.statusCode = 400;
        response.end();
    });

    // process data
    request.on('data', (chunk) => {
        body.push(chunk);
    });

    // make data processed easier to handle by putting the params into an obj
    request.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        const bodyParams = query.parse(bodyString);
        urlStruct[request.method][parsedUrl.pathname](request, response, bodyParams, params);
    });
};

// when a call is made to this server run this
const onRequest = (request, response) => {
    // parse the url using the url module
    // This will let us grab any section of the URL by name
    const parsedUrl = url.parse(request.url);
    const params = query.parse(parsedUrl.query);
    // check if the path name (the /name part of the url) matches
    // any in our url object. If so call that function. If not, default to notReal
    if (request.method === 'POST') {
        handlePost(request, response, parsedUrl, params);
    } else if (urlStruct[request.method][parsedUrl.pathname]) {
        urlStruct[request.method][parsedUrl.pathname](request, response, params);
    } else {
        urlStruct[request.method]['/notReal'](request, response);
    }
};

// create a server that runs the onRequest function when pinged and listens at the specified port
http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
