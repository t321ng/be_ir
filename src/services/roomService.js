import Room from "../models/roomModel.js";

// Service functions for business logic
class RoomService {
  // Create new room (Detail - full populate like getRoomById)
  static async createRoom(roomData) {
    const room = await Room.create(roomData);
    // Return populated object like Detail endpoint
    return await Room.findById(room._id).populate("owner_id", "username email");
  }

  // Get all rooms for a user (List - Light populate)
  static async getRoomsByOwner(ownerId) {
    const rooms = await Room.find({ owner_id: ownerId })
      .populate("owner_id", "username")
      .sort({ created_at: -1 });
    return rooms;
  }

  // Get single room by ID (Detail - Full populate)
  static async getRoomById(roomId, ownerId) {
    const room = await Room.findOne({ _id: roomId, owner_id: ownerId })
      .populate("owner_id", "username email");
    return room;
  }

  // Update room (Detail - full populate like getRoomById)
  static async updateRoom(roomId, ownerId, updateData) {
    const room = await Room.findOneAndUpdate(
      { _id: roomId, owner_id: ownerId },
      updateData,
      { new: true, runValidators: true }
    ).populate("owner_id", "username email");
    return room;
  }

  // Delete room
  static async deleteRoom(roomId, ownerId) {
    const room = await Room.findOneAndDelete({
      _id: roomId,
      owner_id: ownerId,
    });
    return room;
  }

  // Get all rooms (admin only) (List - Light populate)
  static async getAllRooms() {
    const rooms = await Room.find()
      .populate("owner_id", "username")
      .sort({ created_at: -1 });
    return rooms;
  }
}

export default RoomService;
