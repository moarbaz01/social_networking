const jwt = require("jsonwebtoken");
async function checkUser(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token)
    const user = jwt.verify(token, "secret");
    if (!user) {
      return res.status(400).json({
        message: "Unauthorized user",
      });
    }

    console.log(user)

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

module.exports = { checkUser };
