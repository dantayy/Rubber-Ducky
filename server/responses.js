// pull in the file system module
const fs = require('fs');
// querystring module for parsing querystrings from url
const query = require('querystring');

// vars for the html and css the client needs
const index = fs.readFileSync(`${__dirname}/../hosted/client.html`);
const css = fs.readFileSync(`${__dirname}/../hosted/style.css`);
const jsBundle = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);

// Note this object is purely in memory
// When node shuts down this will be cleared.
// Same when your heroku app shuts down from inactivity
// We will be working with databases in the next few weeks.
const users = {};

// for object to respond with when there are status messages/ids
const responseJSON = {};

// returns the base page for the client
const getIndex = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(index);
    response.end();
};

// returns the specified css for the client
const getCSS = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/css' });
    response.write(css);
    response.end();
};

//added function to get our js file in our hosted folder.
//This js file is generated by babel build/run package.json.
//This ES5 file is created from the code in our ES6 file (in the client folder)
const getBundle = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/javascript' });
    response.write(jsBundle);
    response.end();
};

// respond with json data
const respondJSON = (request, response, status, object) => {
    console.log("Writing response with an obj");
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(object));
    response.end();
};

// respond only with headers
const respondJSONMeta = (request, response, status) => {
    console.log("Writing head data only");
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end();
};

// add a user
const addUser = (request, response) => {
    // vars for processing data sent to server for adding a user
    const body = [];
    let bodyString = '';
    let bodyParams = {};

    // .on calls are like event listeners triggering as the users data stream is being processed
    request.on('error', (err) => {
        console.log(err);
        response.statusCode = 400;
        response.end();
    });

    // process data
    request.on('data', (chunk) => {
        console.log("Processing data");
        body.push(chunk);
    });

    // make data processed easier to handle by putting the params into an obj
    request.on('end', () => {
        bodyString = Buffer.concat(body).toString();
        bodyParams = query.parse(bodyString);

        // start with failstate message and check for missing params first
        responseJSON.message = 'Name and age are both required';
        if (!bodyParams.name || !bodyParams.age) {
            responseJSON.id = 'missingParams';
            return respondJSON(request, response, 400, responseJSON);
        }

        // potential response code if a new user was made
        let responseCode = 201;
        // case of a user needing to be updated rather than created
        if (users[bodyParams.name]) {
            responseCode = 204;
        } else { // create a new user
            users[bodyParams.name] = {};
        }

        // set the user's values
        users[bodyParams.name].name = bodyParams.name;
        users[bodyParams.name].age = bodyParams.age;

        // send a response with an obj if a new user was created
        if (responseCode === 201) {
            delete respondJSON.id;
            responseJSON.message = 'Created Successfully';
            return respondJSON(request, response, responseCode, responseJSON);
        }

        // return only header data if stuff was updated rather than created
        return respondJSONMeta(request, response, responseCode);
    });
};

// return the users list
const getUsers = (request, response) => respondJSON(request, response, 200, {users});

// return only a 200 status in this case
const getUsersMeta = (request, response) => respondJSONMeta(request, response, 200);

// send back notReal info
const notReal = (request, response) => {
    responseJSON.id = 'notFound';
    responseJSON.message = 'The page you are looking for was not found.';

    return respondJSON(request, response, 404, responseJSON);
};

// send back only the header data for a page that doesn't exist
const notRealMeta = (request, response) => respondJSONMeta(request, response, 404);

//export relevant functions
module.exports = {
    getIndex,
    getCSS,
    getBundle,
    getUsers,
    getUsersMeta,
    notReal,
    notRealMeta,
    addUser,
};
