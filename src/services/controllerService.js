import Controller from "../models/controllerModel.js";

class ControllerService {
  // Create new controller (ESP32/Gateway) - Detail populate
  static async createController(controllerData) {
    const controller = await Controller.create(controllerData);
    // Return populated object like Detail endpoint
    return await Controller.findById(controller._id)
      .populate("owner_id", "username email")
      .populate("room_id", "name description");
  }

  // Get all controllers for a user (List - Light populate)
  static async getControllersByOwner(ownerId) {
    const controllers = await Controller.find({ owner_id: ownerId })
      .populate("owner_id", "username")
      .populate("room_id", "name")
      .sort({ created_at: -1 });
    return controllers;
  }

  // Get single controller by ID (Detail - Full populate)
  static async getControllerById(controllerId, ownerId) {
    const controller = await Controller.findOne({
      _id: controllerId,
      owner_id: ownerId,
    })
      .populate("owner_id", "username email")
      .populate("room_id", "name description");
    return controller;
  }

  // Update controller (Detail populate)
  static async updateController(controllerId, ownerId, updateData) {
    const controller = await Controller.findOneAndUpdate(
      { _id: controllerId, owner_id: ownerId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("owner_id", "username email")
      .populate("room_id", "name description");
    return controller;
  }

  // Delete controller
  static async deleteController(controllerId, ownerId) {
    const controller = await Controller.findOneAndDelete({
      _id: controllerId,
      owner_id: ownerId,
    });
    return controller;
  }

  // Update controller online status (Detail populate)
  static async updateOnlineStatus(controllerId, online, lastSeen = new Date()) {
    const controller = await Controller.findByIdAndUpdate(
      controllerId,
      { online, last_seen: lastSeen },
      { new: true }
    )
      .populate("owner_id", "username")
      .populate("room_id", "name");
    return controller;
  }

  // Get controllers by room (List - Light populate)
  static async getControllersByRoom(roomId, ownerId) {
    const controllers = await Controller.find({
      room_id: roomId,
      owner_id: ownerId,
    })
      .populate("owner_id", "username")
      .populate("room_id", "name");
    return controllers;
  }

  // Get all online controllers (List - Light populate)
  static async getOnlineControllers(ownerId) {
    const controllers = await Controller.find({
      owner_id: ownerId,
      online: true,
    })
      .populate("owner_id", "username")
      .populate("room_id", "name");
    return controllers;
  }
}

export default ControllerService;
