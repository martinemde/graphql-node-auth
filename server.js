// Copied the basic graphql node setup from GraphQL.org
// Link: https://graphql.org/graphql-js/running-an-express-graphql-server/

const express = require("express");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { auth0Audience, auth0Domain } = require("./config");
const database = require("./database");

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

// The root provides a resolver function for each API endpoint
// This is a simple example app so we include it directly
const root = {
  hello: (args, context) => {
    //console.log(context.auth);
    // The output of context.auth looks like this:
    // {
    //   iss: 'https://dev-cc-example.us.auth0.com/',
    //   sub: 'jMGqRLbIMYf9UQhZs6i5f9mgkiZpD0Yt@clients',
    //   aud: 'https://graphqlauth.example/graphql',
    //   iat: 1626125839,
    //   exp: 1626212239,
    //   azp: 'jMGqRLbIMYf9UQhZs6i5f9mgkiZpD0Yt',
    //   gty: 'client-credentials'
    // }
    //
    // In a real app, you would use `sub` to lookup your user.
    // `sub` means "subject" as in the subject of this JWT.

    // You might also consider loading the user within a middleware if every
    // resolver in your API uses the user. This is just an example.
    const user = database.findUser(context.auth.sub);
    return `Hello ${user.name}!`;
  },
};

// authMiddleware mostly copied from the Auth0 example for Node (Express)
// Link https://auth0.com/docs/quickstart/backend/nodejs/01-authorization
//
// I followed the setup for Auth0 as described, skipping the section about permissions.
const authMiddleware = jwt({
  // Dynamically provide a signing key
  // based on the `kid` in the header and
  // the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
  }),

  // Validate the audience and the issuer.
  audience: auth0Audience,
  issuer: [`https://${auth0Domain}/`],
  algorithms: ["RS256"],

  // Default is `user`. I like to load the actual user model into `user`.
  requestProperty: "auth",
});

const app = express();

// First, check authentication before executing graphql.
// If it fails, we will never enter graphql execution at all.
app.use(authMiddleware);

app.use(
  "/graphql",
  graphqlHTTP((request, response, graphQLParams) => ({
    schema: schema,
    rootValue: root,
    // By default, the request becomes the context.
    // I chose to show it here explicitly to make the connection clear.
    context: {
      // I like to use `auth` for the parsed jwt claims. 'claims' is another good word.
      auth: request.auth,
    },
  }))
);

// Simple error handling to create the unauthorized response I would prefer to see
// It can be good practice to return more descirptive errors only in development.
// Making a special error handler for development makes debugging easier.
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.set("WWW-Authenticate", 'Bearer realm="graphql"');

    // You have some design discretion here about what your 401 error looks like.
    // I like to mimic the graphql error response just to make it easier on my brain.
    // Most client implementations simply notice the 401 and immediately re-authenticate
    // without parsing the body at all, so the actual body is mostly for developers.
    // You could include (non-sensitive) details. Especially useful is whether the token
    // is expired, or whether there is some other condition that might cause failure.
    res.status(401).json({
      errors: [
        {
          message: "Unauthorized",
          extensions: {
            code: err.code,
          },
        },
      ],
    });
  }
});

app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
