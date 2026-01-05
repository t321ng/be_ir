import ControllerService from "../services/controllerService.js";
import { errorHandler } from "../utils/errorHandler.js";

// Create new controller
export const createController = async (req, res) => {
  try {
    const {
      name,
      description,
      room_id,
      mqtt_client_id,
      base_topic,
      cmd_topic,
      status_topic,
      ack_topic,
      has_ir,
      has_sensors,
    } = req.body;

    const owner_id = req.user?._id;

    // console.log(req);
    if (!owner_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    // Validate required fields
    if (!name || name.trim() === "") {
      return errorHandler.missingField(res, "Controller name");
    }

    if (!owner_id) {
      return errorHandler.missingField(res, "Owner ID");
    }

    const controllerData = {
      owner_id,
      name: name.trim(),
      description,
      room_id,
      mqtt_client_id,
      base_topic,
      cmd_topic,
      status_topic,
      ack_topic,
      has_ir,
      has_sensors,
    };

    const controller = await ControllerService.createController(controllerData);
    return res.status(201).json({
      status: "success",
      message: "Controller created successfully",
      data: controller,
    });
  } catch (error) {
    console.error("Error creating controller:", error);
    return errorHandler.handle(res, error);
  }
};

// Get all controllers for current user
export const getControllers = async (req, res) => {
  try {
    const owner_id = req.user?._id || req.query.owner_id;

    if (!owner_id) {
      return errorHandler.missingField(res, "Owner ID");
    }

    const controllers = await ControllerService.getControllersByOwner(owner_id);

    if (!controllers || controllers.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No controllers found",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      count: controllers.length,
      data: controllers,
    });
  } catch (error) {
    console.error("Error getting controllers:", error);
    return errorHandler.handle(res, error);
  }
};

// Get single controller by ID
export const getControllerById = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user?._id || req.query.owner_id;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "Controller ID");
    }

    if (!owner_id) {
      return errorHandler.missingField(res, "Owner ID");
    }

    const controller = await ControllerService.getControllerById(id, owner_id);

    if (!controller) {
      return errorHandler.notFound(res, "Controller");
    }

    return res.status(200).json({
      status: "success",
      data: controller,
    });
  } catch (error) {
    console.error("Error getting controller:", error);
    return errorHandler.handle(res, error);
  }
};

// Update controller
export const updateController = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user?._id;

    if (!owner_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    const allowedUpdates = [
      "name",
      "description",
      "room_id",
      "mqtt_client_id",
      "base_topic",
      "cmd_topic",
      "status_topic",
      "ack_topic",
      "has_ir",
      "has_sensors",
    ];

    const updateData = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const controller = await ControllerService.updateController(
      id,
      owner_id,
      updateData
    );

    if (!controller) {
      return res.status(404).json({
        status: "error",
        message: "Controller not found or unauthorized",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Controller updated successfully",
      data: controller,
    });
  } catch (error) {
    console.error("Error updating controller:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete controller
export const deleteController = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user?._id || req.body.owner_id;

    const controller = await ControllerService.deleteController(id, owner_id);

    if (!controller) {
      return res.status(404).json({
        status: "error",
        message: "Controller not found or unauthorized",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Controller deleted successfully",
      data: controller,
    });
  } catch (error) {
    console.error("Error deleting controller:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update controller online status
export const updateOnlineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { online } = req.body;

    if (typeof online !== "boolean") {
      return res.status(400).json({ error: "Online status must be a boolean" });
    }

    const controller = await ControllerService.updateOnlineStatus(id, online);

    if (!controller) {
      return res.status(404).json({
        status: "error",
        message: "Controller not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Controller status updated",
      data: controller,
    });
  } catch (error) {
    console.error("Error updating controller status:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get controllers by room
export const getControllersByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const owner_id = req.user?._id || req.query.owner_id;

    const controllers = await ControllerService.getControllersByRoom(
      roomId,
      owner_id
    );
    return res.status(200).json({
      status: "success",
      count: controllers.length,
      data: controllers,
    });
  } catch (error) {
    console.error("Error getting controllers by room:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get online controllers
export const getOnlineControllers = async (req, res) => {
  try {
    const owner_id = req.user?._id || req.query.owner_id;

    const controllers = await ControllerService.getOnlineControllers(owner_id);
    return res.status(200).json({
      status: "success",
      count: controllers.length,
      data: controllers,
    });
  } catch (error) {
    console.error("Error getting online controllers:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
