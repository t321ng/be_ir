import Command from "../models/commandModel.js";

class CommandService {
  // Create new command (Detail populate)
  static async createCommand(commandData) {
    const command = await Command.create(commandData);
    // Return populated object like Detail endpoint
    return await Command.findById(command._id)
      .populate("user_id", "username email")
      .populate("controller_id", "name online cmd_topic ack_topic status_topic")
      .populate("appliance_id", "name brand device_type")
      .populate("room_id", "name description")
      .populate("ir_code_id", "action protocol brand device_type");
  }

  // Get all commands for a user (List - Light populate)
  static async getCommandsByUser(userId, limit = 100) {
    const commands = await Command.find({ user_id: userId })
      .populate("user_id", "username")
      .populate("controller_id", "name")
      .populate("appliance_id", "name device_type")
      .populate("room_id", "name")
      .populate("ir_code_id", "action")
      .sort({ created_at: -1 })
      .limit(limit);
    return commands;
  }

  // Get single command by ID (Detail - Full populate)
  static async getCommandById(commandId, userId) {
    const command = await Command.findOne({
      _id: commandId,
      user_id: userId,
    })
      .populate("user_id", "username email")
      .populate("controller_id", "name online cmd_topic ack_topic status_topic")
      .populate("appliance_id", "name brand device_type")
      .populate("room_id", "name description")
      .populate("ir_code_id", "action protocol brand device_type");
    return command;
  }

  // Update command (Detail - Full populate)
  static async updateCommand(commandId, userId, updateData) {
    // Verify ownership - user can only update their own commands
    const existingCommand = await Command.findOne({
      _id: commandId,
      // user_id: userId,
    });

    if (!existingCommand) {
      return null;
    }

    // Handle automatic timestamp updates based on status
    const finalUpdateData = { ...updateData };
    if (updateData.status === "sent" && !updateData.sent_at) {
      finalUpdateData.sent_at = new Date();
    }
    if (updateData.status === "acked" && !updateData.ack_at) {
      finalUpdateData.ack_at = new Date();
    }

    const command = await Command.findByIdAndUpdate(commandId, finalUpdateData, {
      new: true,
    })
      // .populate("user_id", "username email")
      .populate("controller_id", "name online cmd_topic ack_topic status_topic")
      .populate("appliance_id", "name brand device_type")
      .populate("room_id", "name description")
      .populate("ir_code_id", "action protocol brand device_type");
    
    return command;
  }

  // Get commands by controller (List - Light populate)
  static async getCommandsByController(controllerId, limit = 100) {
    const commands = await Command.find({ controller_id: controllerId })
      .populate("user_id", "username")
      .populate("appliance_id", "name")
      .populate("room_id", "name")
      .populate("ir_code_id", "action")
      .sort({ created_at: -1 })
      .limit(limit);
    return commands;
  }

  // Get commands by appliance (List - Light populate)
  static async getCommandsByAppliance(applianceId, userId, limit = 50) {
    const commands = await Command.find({
      appliance_id: applianceId,
      user_id: userId,
    })
      .populate("user_id", "username")
      .populate("controller_id", "name")
      .populate("room_id", "name")
      .populate("ir_code_id", "action")
      .sort({ created_at: -1 })
      .limit(limit);
    return commands;
  }

  // Get commands by room (List - Light populate)
  static async getCommandsByRoom(roomId, userId, limit = 100) {
    const commands = await Command.find({
      room_id: roomId,
      user_id: userId,
    })
      .populate("user_id", "username")
      .populate("controller_id", "name")
      .populate("appliance_id", "name")
      .populate("ir_code_id", "action")
      .sort({ created_at: -1 })
      .limit(limit);
    return commands;
  }

  // Get commands by status (List - Light populate)
  static async getCommandsByStatus(status, userId = null) {
    const query = { status };
    if (userId) query.user_id = userId;

    const commands = await Command.find(query)
      .populate("user_id", "username")
      .populate("controller_id", "name")
      .populate("appliance_id", "name")
      .populate("ir_code_id", "action")
      .sort({ created_at: -1 });
    return commands;
  }

  // Get pending commands (queued + sent but not acked) - List populate
  static async getPendingCommands(controllerId = null) {
    const query = { status: { $in: ["queued", "sent"] } };
    if (controllerId) query.controller_id = controllerId;

    const commands = await Command.find(query)
      .populate("user_id", "username")
      .populate("controller_id", "name cmd_topic")
      .populate("appliance_id", "name")
      .populate("room_id", "name")
      .populate("ir_code_id", "action")
      .sort({ created_at: 1 }); // Oldest first
    return commands;
  }

  // Delete old commands (cleanup)
  static async deleteOldCommands(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Command.deleteMany({
      created_at: { $lt: cutoffDate },
      status: { $in: ["acked", "failed"] },
    });
    return result;
  }

  // Get command statistics
  static async getCommandStats(userId, startDate, endDate) {
    const query = { user_id: userId };
    if (startDate && endDate) {
      query.created_at = { $gte: startDate, $lte: endDate };
    }

    const stats = await Command.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return stats;
  }
}

export default CommandService;
