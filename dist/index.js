"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Express web server framework
const request_1 = __importDefault(require("request")); // "Request" library
const cors_1 = __importDefault(require("cors"));
/* tslint:disable-next-line */
const querystring = require('querystring');
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/* tslint:disable-next-line */
const client_id = process.env.CLIENT_ID;
/* tslint:disable-next-line */
const client_secret = process.env.CLIENT_SECRET;
/* tslint:disable-next-line */
const redirect_uri = process.env.REDIRECT_URI;
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
const stateKey = 'spotify_auth_state';
const app = (0, express_1.default)();
app
    .use(express_1.default.static(__dirname + '/public'))
    .use((0, cors_1.default)())
    .use((0, cookie_parser_1.default)());
app.get('/', (_, res) => res.send('Login'));
app.get('/login', (_, res) => {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);
    // your application requests authorization
    const scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id,
            scope,
            redirect_uri,
            state,
        }));
});
app.get('/callback', (req, res) => {
    // your application requests refresh and access tokens
    // after checking the state parameter
    let code = null;
    let state = null;
    let storedState = null;
    if (req.query) {
        code = req.query.code;
        state = req.query.state;
    }
    if (req.cookies) {
        storedState = req.cookies[stateKey];
    }
    ;
    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch',
            }));
    }
    else {
        res.clearCookie(stateKey);
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code,
                redirect_uri,
                grant_type: 'authorization_code',
            },
            headers: {
                Authorization: 'Basic ' +
                    Buffer.from(client_id + ':' + client_secret).toString('base64'),
            },
            json: true,
        };
        request_1.default.post(authOptions, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const access_token = body.access_token;
                const refresh_token = body.refresh_token;
                const options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { Authorization: 'Bearer ' + access_token },
                    json: true,
                };
                // use the access token to access the Spotify Web API\
                /* tslint:disable-next-line */
                request_1.default.get(options, (error, _, body) => {
                    if (error)
                        throw new Error(error);
                    /* tslint:disable-next-line */
                    console.log(body);
                });
                // we can also pass the token to the browser to make requests from there
                res.redirect('/#' +
                    querystring.stringify({
                        access_token,
                        refresh_token,
                    }));
            }
            else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token',
                    }));
            }
        });
    }
});
app.get('/refresh_token', (req, res) => {
    // requesting access token from refresh token
    const refresh_token = req.query.refresh_token;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            Authorization: 'Basic ' +
                Buffer.from(client_id + ':' + client_secret).toString('base64'),
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token,
        },
        json: true,
    };
    request_1.default.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const access_token = body.access_token;
            res.send({
                access_token,
            });
        }
    });
});
/* tslint:disable-next-line */
console.log('Listening on 8888');
app.listen(8888);
//# sourceMappingURL=index.js.map