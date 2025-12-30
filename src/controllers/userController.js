import UserService from "../services/userService.js";
import { errorHandler } from "../utils/errorHandler.js";

const allowedRoles = ["user", "admin"];

// Create new user
export const createUser = async (req, res) => {
  try {
    const { username, email, password_hash, role = "user" } = req.body;

    if (!username || username.trim() === "") {
      return errorHandler.missingField(res, "Username");
    }
    if (!email || email.trim() === "") {
      return errorHandler.missingField(res, "Email");
    }
    if (!password_hash || password_hash.trim() === "") {
      return errorHandler.missingField(res, "Password hash");
    }
    if (role && !allowedRoles.includes(role)) {
      return errorHandler.validationError(
        res,
        `Invalid role. Must be one of: ${allowedRoles.join(", ")}`
      );
    }

    const userData = {
      username: username.trim(),
      email: email.trim(),
      password_hash,
      role,
    };

    const user = await UserService.createUser(userData);
    const safe = user.toObject();
    delete safe.password_hash;

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: safe,
    });
  } catch (error) {
    return errorHandler.handle(res, error);
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await UserService.getUsers();

    return res.status(200).json({
      status: "success",
      count: users.length,
      data: users,
    });
  } catch (error) {
    return errorHandler.handle(res, error);
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "User ID");
    }

    const user = await UserService.getUserById(id);
    if (!user) {
      return errorHandler.notFound(res, "User");
    }

    return res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    return errorHandler.handle(res, error);
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password_hash, role } = req.body;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "User ID");
    }

    const updateData = {};
    if (username !== undefined && username.trim() !== "") updateData.username = username.trim();
    if (email !== undefined && email.trim() !== "") updateData.email = email.trim();
    if (password_hash !== undefined) updateData.password_hash = password_hash;
    if (role !== undefined) {
      if (!allowedRoles.includes(role)) {
        return errorHandler.validationError(
          res,
          `Invalid role. Must be one of: ${allowedRoles.join(", ")}`
        );
      }
      updateData.role = role;
    }

    if (Object.keys(updateData).length === 0) {
      return errorHandler.validationError(res, "At least one field is required to update");
    }

    const user = await UserService.updateUser(id, updateData);
    if (!user) {
      return errorHandler.notFound(res, "User");
    }

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return errorHandler.handle(res, error);
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "User ID");
    }

    const user = await UserService.deleteUser(id);
    if (!user) {
      return errorHandler.notFound(res, "User");
    }

    return res.status(200).json({
      status: "success",
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    return errorHandler.handle(res, error);
  }
};
