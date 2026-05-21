'use strict';

// Must be set before any module that reads JWT_SECRET is required.
// Mocha loads this file first via --require (see .mocharc or package.json).
process.env.JWT_SECRET = 'test_secret';

// Returns a Promise that also exposes a chainable .select() method so it works
// for both middleware calls (User.findById().select('-password')) and
// controller calls (await User.findById(id)) without separate stubs.
function findByIdResult(data) {
  const p = Promise.resolve(data);
  p.select = () => Promise.resolve(data);
  return p;
}

module.exports = { findByIdResult };
