import User from "../models/userModel.js";

class UserService {
  static async createUser(userData) {
    const user = await User.create(userData);
    return user;
  }

  static async getUsers() {
    const users = await User.find()
      .select("-password_hash")
      .sort({ created_at: -1 });
    return users;
  }

  static async getUserById(userId) {
    const user = await User.findById(userId).select("-password_hash");
    return user;
  }

  static async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password_hash");
    return user;
  }

  static async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId).select("-password_hash");
    return user;
  }
}

export default UserService;
