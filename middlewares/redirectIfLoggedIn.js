function redirectIfLoggedIn(req, res, next) {
  if (req.session.userId) {
    res.redirect("/prof/");
  }
  next();
}

module.exports = redirectIfLoggedIn;
