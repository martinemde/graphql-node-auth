// Pretend to have a database

// This is my Users table. As you can see, we've had infinite year over year growth.
const users = {
  1: { name: "Martin" },
};

// I like to link users to their identities with a separate table.
//
// It's possible to have many different identities for the same user.
// This pattern simplifies that association and keeps cruft out of the
// user table.
//
// A real table might also save the issuer, allowing you to connect one user
// with many different authentication systems.
const identities = {
  "jMGqRLbIMYf9UQhZs6i5f9mgkiZpD0Yt@clients": { userId: 1 },
};

// Pretent to lookup the user. We're just using static data.
const findUser = function (sub) {
  const identity = identities[sub];
  if (identity) {
    return users[identity.userId];
  } else {
    // In a real app, when a new identity arrives, simply create an identity record
    // for the new unknown `sub`. You have confirmation from your authentication provider
    // that any valid JWT arriving at your endpoint has been authenticated.
    //
    // After you create the identity, you can etch the userinfo from Auth0, if interested.
    // You can also request scopes to include profile and email in the JWT.
    //
    // Alternatively, you now have an authenticated user and any queries they
    // perform will be connected to this identity. You can have your client
    // applications ask for any other information you need to finish the user
    // record.
    //
    // This is just a little hack to make my example work more smoothly.
    return { name: "New user" };
  }
};

module.exports = {
  findUser,
};
