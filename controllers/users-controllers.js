const HttpError = require("../model/http-error");
const { validationResult } = require("express-validator");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(
      new HttpError("Something went wrong! Could not find users", 500)
    );
  }
  res.status(200).json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input passed, please check data", 422));
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Somthing went wrong in the database!", 500));
  }
  if (existingUser) {
    return next(new HttpError("User exists already, please login", 422));
  }

  let hashPassword;
  try {
    hashPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user please try again", 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Sign up failed, please try again", 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Sign up failed, please try again", 500));
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input passed, please check data", 422));
  }
  const { email, password } = req.body;

  let loginUser;
  try {
    loginUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError(
        "Something went wrong in the database! Could not login",
        500
      )
    );
  }

  if (!loginUser) {
    return next(
      new HttpError("Invlaid credentials, could not log you in", 403)
    );
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, loginUser.password);
  } catch (err) {
    return next(
      new HttpError(
        "Could not log you in, please check you credntials and try again",
        500
      )
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError("Invlaid credentials, could not log you in", 401)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: loginUser.id, email: loginUser.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Logging infailed, please try again", 500));
  }

  res.status(201).json({
    userId: loginUser.id,
    email: loginUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
