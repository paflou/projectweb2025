function checkPermission(role) {
  return function (req, res, next) {
    if (!req.session.userId) {
      return res.redirect('/');
    }
    else if (req.session.role !== role)
      return res.redirect('/');
    next(); // User is logged in — proceed to the next middleware or route
  }
}

module.exports = checkPermission;
