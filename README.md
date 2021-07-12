# graphql-node-auth-example

An example app that uses Auth0 to authenticate an Express GraphQL app

The purpose of this app is to show how to make a secure authentication system for GraphQL without using graphql mutations for login and signup.

I believe using graphql for signup and login mutations causes more harm than good. Read more about my opinion on the Cloud City Development blog.

# Principals of good out-of-band authentication in GraphQL

- Use a separate authentication endpoint
- Require authentication for the entire GraphQL endpoint
- Return 401 on failed or expired authentication
- Load the user into context before executing the query

I built this app with the aim of explaining these principals so other's could build from an example that starts with good practices. My hope is to save you from security vulnerabilities and ultimately reduce the pain of a future migration to a better authentication system. Ultimately, every application is unique, and though I tried to give a good example, this is still just a toy app I made to explain these ideas. It's up to you to evaluate my code and make your own decisions about your security practices. I hope my example gives you another perspective that makes your application better and more secure.

## Getting Started

If you'd like to run this test app, first, follow the [Auth0 Node tutorial](https://auth0.com/docs/quickstart/backend/nodejs/01-authorization) until you have an API configured in Auth0. You don't need to setup permissions or create an application on Auth0. I don't use any of that here.

Clone the app locally and install dependencies

```
npm i
```

Modify `config.js` to use your freshly configured Auth0 values for your domain and audience.

Run the server

```
npm start
```

Fetch your example API token using the test token cURL command from the Auth0 dashboard.

To find this test API token command, go to the [API section on the Auth0 Dashboard](https://manage.auth0.com/dashboard/us/dev-cc-example/apis) and click on the API you created in the Tutorial I linked above. Choose the 'Test' submenu and copy the cURL commannd. It should look something like the command below:

(this command will change depending on your Auth0 config, don't copy my command here).

```
# Don't copy this, get your own!
curl --request POST \
  --url https://dev-cc-example.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{"client_id":"jMGqRLbIMYf9UQhZs6i5f9mgkiZpD0Yt","client_secret":"930200nall1cPWV-FLs8hu20934b-RzBzluhhha383hoheOEli0dJ73CvFIJXl20","audience":"https://graphqlauth.example/graphql","grant_type":"client_credentials"}'
```

You'll get a response like the following which contains your new auth token.

```
{"access_token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkF3ZFVIcWNoUUw5NENoeGxZSDBzRSJ9.eyJpc3MiOiJodHRwczovL2Rldi1jYy1leGFtcGxlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJqTUdxUkxiSU1ZZjlVUWhaczZpNWY5bWdraVpwRDBZdEBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9ncmFwaHFsYXV0aC5leGFtcGxlL2dyYXBocWwiLCJpYXQiOjE2MjYxMjU4MzksImV4cCI6MTYyNjIxMjIzOSwiYXpwIjoiak1HcVJMYklNWWY5VVFoWnM2aTVmOW1na2lacEQwWXQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.YSY6hAO_9XYEKjmR1V14liCcyWlJe3_uhFB5MAFO7AfkgMsk1GNUMP2lLlIYw2-fuEHrfuPDzr-ymaLCAJ28zI0qiavLrHdXSKNQtwWVZi9gDNuhaHKjFmEUdzUStZjDon71mQ67M_vxm_QT7keXsjvjoPMoXd5ro2F4FQNWYOO36aGlNVWU2g3Q6pay1L2x0KwNjKMXNSzBWv386WO-j7Shn6BAXCUUj7laVu5XXXtyLrcozVMyOVq5nFnXlihYpEtie1OD3U0tg0L5yPndgmFoD4YQW0SmlqIc50PXB_iLunKYSl1mlmQYOpUW4Fjts0TrKkr5-2Gr7ak9EY8zAA","expires_in":86400,"token_type":"Bearer"}%
```

Copy the entire access token (without the quotes). If you have any trouble, go to [jwt.io](https://jwt.io) and paste this token into the JWT parser to verify that you copied a valid token. If it doesn't parse, you copied it wrong.

## Perform an authenticated query!

Now that everything is ready, try querying the running GraphQL API.

Make sure to substitute your access_token above into the request below.

```
# The Authorization header contains my test token. Substitute your own token here.
curl --request POST \
  --url http://localhost:4000/graphql \
  --header 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkF3ZFVIcWNoUUw5NENoeGxZSDBzRSJ9.eyJpc3MiOiJodHRwczovL2Rldi1jYy1leGFtcGxlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJqTUdxUkxiSU1ZZjlVUWhaczZpNWY5bWdraVpwRDBZdEBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9ncmFwaHFsYXV0aC5leGFtcGxlL2dyYXBocWwiLCJpYXQiOjE2MjYxMjU4MzksImV4cCI6MTYyNjIxMjIzOSwiYXpwIjoiak1HcVJMYklNWWY5VVFoWnM2aTVmOW1na2lacEQwWXQiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.YSY6hAO_9XYEKjmR1V14liCcyWlJe3_uhFB5MAFO7AfkgMsk1GNUMP2lLlIYw2-fuEHrfuPDzr-ymaLCAJ28zI0qiavLrHdXSKNQtwWVZi9gDNuhaHKjFmEUdzUStZjDon71mQ67M_vxm_QT7keXsjvjoPMoXd5ro2F4FQNWYOO36aGlNVWU2g3Q6pay1L2x0KwNjKMXNSzBWv386WO-j7Shn6BAXCUUj7laVu5XXXtyLrcozVMyOVq5nFnXlihYpEtie1OD3U0tg0L5yPndgmFoD4YQW0SmlqIc50PXB_iLunKYSl1mlmQYOpUW4Fjts0TrKkr5-2Gr7ak9EY8zAA' \
  --header 'Content-Type: application/json' \
  --data '{"query":"query {\n  hello\n}"}'
```

Yay! We got a response:

```
{
    "data":{
        "hello": "Hello Martin!"
    }
}
```

### Unauthenticated queries

Now try access without the token:

```
curl -v --request POST \
  --url http://localhost:4000/graphql \
  --header 'Content-Type: application/json' \
  --data '{"query":"query {\n  hello\n}"}'
```

And we receive a nice unauthorized response:

```
> POST /graphql HTTP/1.1
> Host: localhost:4000
> User-Agent: curl/7.64.1
> Accept: */*
> Content-Type: application/json
> Content-Length: 31
>
< HTTP/1.1 401 Unauthorized
< X-Powered-By: Express
< WWW-Authenticate: Bearer realm="graphql"
< Content-Type: application/json; charset=utf-8
< Content-Length: 39
< ETag: W/"27-M+NKBmJicHoEHY9N+3z9/MyjfrA"
< Date: Mon, 12 Jul 2021 23:39:25 GMT
<
{"errors":[{"message":"Unauthorized","extensions":{"code":"credentials_required"}}]}
```

Similarly, an invalid token returns:

```
{"errors":[{"message":"Unauthorized","extensions":{"code":"invalid_token"}}]}
```

## Acknowledgements

The basic graphql express example was copied from this
[GraphQL.org tutorial](https://graphql.org/graphql-js/running-an-express-graphql-server/).

The Auth0 login middleware was copied from
[Auth0 node tutorial](https://auth0.com/docs/quickstart/backend/nodejs/01-authorization).

Note: I had to mess around with the Auth0 config a bit, but it took less than an hour to get this working. To speed up getting your token to test API calls, use the example cURL found
by clicking on the API you created [here](https://manage.auth0.com/dashboard/us/dev-cc-example/apis) then choosing the 'Test' submenu.

Thank you to my friends a [Cloud City Development](https://cloudcity.io) for giving me the time and support to create this example.
