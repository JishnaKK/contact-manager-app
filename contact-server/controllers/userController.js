const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const userRegister = expressAsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("all field is mandatory");
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("user already registered");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  console.log(`hashpswd is ${hashPassword}`);
  const user = await User.create({
    username,
    email,
    password: hashPassword,
  });
  console.log(`user created is ${user}`);
  if (user) {
    res
      .status(201)
      .json({ _id: user.id, username: user.username, email: user.email });
  } else {
    res.status(400);
    throw new Error("user data is not valid");
  }

  res.json({ msg: "register" });
});

const userLogin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("all field is mandotory");
  }
  const loginuser = await User.findOne({ email });
  // compare password with hashpasword
  if (loginuser && (await bcrypt.compare(password, loginuser.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: loginuser.username,
          email: loginuser.email,
          id: loginuser.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "12m" }
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("email or password is not valid");
  }
});

const currentUser = expressAsyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { userRegister, userLogin, currentUser };
