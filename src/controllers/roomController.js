import RoomService from "../services/roomService.js";

// Create new room
export const createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    const owner_id = req.user?._id;


    if (!owner_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Room name is required and cannot be empty",
      });
    }

    const roomData = {
      owner_id,
      name: name.trim(),
      description: description?.trim() || "",
    };

    const room = await RoomService.createRoom(roomData);
    return res.status(201).json({
      status: "success",
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    console.error("Error creating room:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        details: messages,
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "Room name already exists",
      });
    }

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all rooms for current user
export const getRooms = async (req, res) => {
  try {
    const owner_id = req.user?._id;
    // console.log(req);
    // console.log(req.user);
    const resq = req.user;
    // console.log(owner_id);
    if (!owner_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    const rooms = await RoomService.getRoomsByOwner(owner_id);

    if (!rooms || rooms.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No rooms found",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    console.error("Error getting rooms:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get single room by ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user?._id;

    if (!id || id.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Room ID is required",
      });
    }

    if (!owner_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    const room = await RoomService.getRoomById(id, owner_id);

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found or you do not have permission to access this room",
      });
    }

    return res.status(200).json({
      status: "success",
      data: room,
    });
  } catch (error) {
    console.error("Error getting room:", error);

    // Handle invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        status: "error",
        message: "Invalid room ID format",
      });
    }

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update room
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user?._id;
    const { name, description } = req.body;

    if (!id || id.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Room ID is required",
      });
    }

    if (!owner_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    // Check if at least one field is provided to update
    if (!name && description === undefined) {
      return res.status(400).json({
        status: "error",
        message: "At least one field (name or description) is required to update",
      });
    }

    const updateData = {};
    if (name && name.trim() !== "") updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();

    const room = await RoomService.updateRoom(id, owner_id, updateData);

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found or you do not have permission to update this room",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    console.error("Error updating room:", error);

    // Handle invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        status: "error",
        message: "Invalid room ID format",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        details: messages,
      });
    }

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user?._id || req.body.owner_id;

    if (!id || id.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Room ID is required",
      });
    }

    if (!owner_id) {
      return res.status(400).json({
        status: "error",
        message: "Owner ID is required",
      });
    }

    const room = await RoomService.deleteRoom(id, owner_id);

    if (!room) {
      return res.status(404).json({
        status: "error",
        message: "Room not found or you do not have permission to delete this room",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Room deleted successfully",
      data: room,
    });
  } catch (error) {
    console.error("Error deleting room:", error);

    // Handle invalid ObjectId
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        status: "error",
        message: "Invalid room ID format",
      });
    }

    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all rooms (admin only)
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await RoomService.getAllRooms();
    return res.status(200).json({
      status: "success",
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    console.error("Error getting all rooms:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
