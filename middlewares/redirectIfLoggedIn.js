function redirectIfLoggedIn(req, res, next) {
  if (req.session.email) {
    return res.redirect('/');
  }
  next();
}

module.exports = redirectIfLoggedIn;
