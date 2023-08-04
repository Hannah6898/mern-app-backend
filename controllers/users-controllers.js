const HttpError = require("../model/http-error");
const { validationResult } = require("express-validator");
const User = require("../model/user");

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

  const createdUser = new User({
    name,
    email,
    password,
    image: req.file.path,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Sign up failed, please try again", 500));
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
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
      new HttpError("Somthing went wrong in the database! Could not login", 500)
    );
  }

  if (!loginUser || loginUser.password !== password) {
    return next(
      new HttpError("Invlaid credentials, could not log you in", 401)
    );
  }

  res.json({
    message: "Logged in",
    user: loginUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
