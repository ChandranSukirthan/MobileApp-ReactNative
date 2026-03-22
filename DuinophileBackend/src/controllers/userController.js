const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');


const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return successResponse(res, users, 'Users fetched successfully');
  } catch (error) {
    next(error);
  }
};


const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User fetched successfully');
  } catch (error) {
    next(error);
  }
};


const createUser = async (req, res, next) => {
  try {
    const { name, email, bio } = req.body;

    if (!name || !email) {
      return errorResponse(res, 'Name and email are required', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already exists', 400);
    }

    const user = await User.create({ name, email, bio });

    return successResponse(res, user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};


const updateUser = async (req, res, next) => {
  try {
    const { name, bio } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name: name || user.name, bio: bio || user.bio },
      { new: true, runValidators: true }
    );

    return successResponse(res, updatedUser, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};


const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await User.findByIdAndDelete(req.params.id);

    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};