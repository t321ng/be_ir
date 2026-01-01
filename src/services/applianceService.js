import Appliance from "../models/applianceModel.js";

class ApplianceService {
  // Create new appliance (IR device) - Detail populate
  static async createAppliance(applianceData) {
    const appliance = await Appliance.create(applianceData);
    // Return populated object like Detail endpoint
    return await Appliance.findById(appliance._id)
      .populate("owner_id", "username email")
      .populate("room_id", "name description")
      .populate("controller_id", "name online cmd_topic ack_topic");
  }

  // Get all appliances for a user (List - Light populate)
  static async getAppliancesByOwner(ownerId) {
    const appliances = await Appliance.find({ owner_id: ownerId })
      // .populate("owner_id", "username")
      // .populate("room_id", "name")
      // .populate("controller_id", "name")
      .populate("owner_id")
      .populate("room_id")
      .populate("controller_id")
      .sort({ created_at: -1 });
    return appliances;
  }

  // Get single appliance by ID (Detail - Full populate)
  static async getApplianceById(applianceId, ownerId) {
    const appliance = await Appliance.findOne({
      _id: applianceId,
      owner_id: ownerId,
    })
      .populate("owner_id", "username email")
      .populate("room_id", "name description")
      .populate("controller_id", "name online cmd_topic ack_topic status_topic");
    return appliance;
  }

  // Update appliance (Detail populate)
  static async updateAppliance(applianceId, ownerId, updateData) {
    const appliance = await Appliance.findOneAndUpdate(
      { _id: applianceId, owner_id: ownerId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("owner_id", "username email")
      .populate("room_id", "name description")
      .populate("controller_id", "name online cmd_topic ack_topic status_topic");
    return appliance;
  }

  // Delete appliance
  static async deleteAppliance(applianceId, ownerId) {
    const appliance = await Appliance.findOneAndDelete({
      _id: applianceId,
      owner_id: ownerId,
    });
    return appliance;
  }

  // Get appliances by room (List - Light populate)
  static async getAppliancesByRoom(roomId, ownerId) {
    const appliances = await Appliance.find({
      room_id: roomId,
      owner_id: ownerId,
    })
      .populate("owner_id", "username")
      .populate("room_id", "name")
      .populate("controller_id", "name");
    return appliances;
  }

  // Get appliances by controller (List - Light populate)
  static async getAppliancesByController(controllerId, ownerId) {
    const appliances = await Appliance.find({
      controller_id: controllerId,
      owner_id: ownerId,
    })
      .populate("owner_id", "username")
      .populate("room_id", "name")
      .populate("controller_id", "name");
    return appliances;
  }

  // Get appliances by device type (List - Light populate)
  static async getAppliancesByType(deviceType, ownerId) {
    const appliances = await Appliance.find({
      device_type: deviceType,
      owner_id: ownerId,
    })
      .populate("owner_id", "username")
      .populate("room_id", "name")
      .populate("controller_id", "name");
    return appliances;
  }
}

export default ApplianceService;
