const HttpError = require("../model/http-error");
const uuid = require("uuid");
const {validationResult} = require('express-validator')

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Hannah",
    email: "Hannah@gmail.com",
    password: "test",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    throw new HttpError('Invalid input passed, please check data', 422)
  }
  const { name, email, password } = req.body;

  const hasUser  = DUMMY_USERS.find(u => u.email === email);
  if (hasUser){
    throw new HttpError("Could not create User.User already created", 422);
  }
  const createdUser = {
    id: uuid.v4(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);
  res.status(201).json({ user: createdUser });
};
const login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    throw new HttpError('Invalid input passed, please check data', 422)
  }
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("Could not identify User", 401);
  }
  res.json({message: 'Login in'});
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;

