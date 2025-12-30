import ApplianceService from "../services/applianceService.js";
import { errorHandler } from "../utils/errorHandler.js";

// Create new appliance
export const createAppliance = async (req, res) => {
  try {
    const {
      name,
      brand,
      device_type,
      description,
      room_id,
      controller_id,
    } = req.body;

    
    const owner_id = req.user?._id;

    if (!owner_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    // Validate required fields
    if (!name || name.trim() === "") {
      return errorHandler.missingField(res, "Appliance name");
    }

    if (!device_type || device_type.trim() === "") {
      return errorHandler.missingField(res, "Device type");
    }

    if (!controller_id) {
      return errorHandler.missingField(res, "Controller ID");
    }

    if (!owner_id) {
      return errorHandler.missingField(res, "Owner ID");
    }

    const applianceData = {
      owner_id,
      name: name.trim(),
      brand,
      device_type,
      description,
      room_id,
      controller_id,
    };

    const appliance = await ApplianceService.createAppliance(applianceData);
    return res.status(201).json({
      status: "success",
      message: "Appliance created successfully",
      data: appliance,
    });
  } catch (error) {
    console.error("Error creating appliance:", error);
    return errorHandler.handle(res, error);
  }
};

// Get all appliances for current user
export const getAppliances = async (req, res) => {
  try {
    const owner_id = req.user?._id || req.query.owner_id;

    if (!owner_id) {
      return errorHandler.missingField(res, "Owner ID");
    }

    const appliances = await ApplianceService.getAppliancesByOwner(owner_id);

    if (!appliances || appliances.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No appliances found",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      count: appliances.length,
      data: appliances,
    });
  } catch (error) {
    console.error("Error getting appliances:", error);
    return errorHandler.handle(res, error);
  }
};

// Get single appliance by ID
export const getApplianceById = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user?._id || req.query.owner_id;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "Appliance ID");
    }

    if (!owner_id) {
      return errorHandler.missingField(res, "Owner ID");
    }

    const appliance = await ApplianceService.getApplianceById(id, owner_id);

    if (!appliance) {
      return errorHandler.notFound(res, "Appliance");
    }

    return res.status(200).json({
      status: "success",
      data: appliance,
    });
  } catch (error) {
    console.error("Error getting appliance:", error);
    return errorHandler.handle(res, error);
  }
};

// Update appliance
export const updateAppliance = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user?._id;

    if (!owner_id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized - User ID not found in token",
      });
    }

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "Appliance ID");
    }

    if (!owner_id) {
      return errorHandler.missingField(res, "Owner ID");
    }

    const allowedUpdates = [
      "name",
      "brand",
      "device_type",
      "description",
      "room_id",
      "controller_id",
    ];

    const updateData = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "At least one field is required to update",
      });
    }

    const appliance = await ApplianceService.updateAppliance(
      id,
      owner_id,
      updateData
    );

    if (!appliance) {
      return errorHandler.notFound(res, "Appliance");
    }

    return res.status(200).json({
      status: "success",
      message: "Appliance updated successfully",
      data: appliance,
    });
  } catch (error) {
    console.error("Error updating appliance:", error);
    return errorHandler.handle(res, error);
  }
};

// Delete appliance
export const deleteAppliance = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user?._id || req.body.owner_id;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "Appliance ID");
    }

    if (!owner_id) {
      return errorHandler.missingField(res, "Owner ID");
    }

    const appliance = await ApplianceService.deleteAppliance(id, owner_id);

    if (!appliance) {
      return errorHandler.notFound(res, "Appliance");
    }

    return res.status(200).json({
      status: "success",
      message: "Appliance deleted successfully",
      data: appliance,
    });
  } catch (error) {
    console.error("Error deleting appliance:", error);
    return errorHandler.handle(res, error);
  }
};

// Get appliances by room
export const getAppliancesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const owner_id = req.user?._id || req.query.owner_id;

    if (!roomId || roomId.trim() === "") {
      return errorHandler.missingField(res, "Room ID");
    }

    if (!owner_id) {
      return errorHandler.missingField(res, "Owner ID");
    }

    const appliances = await ApplianceService.getAppliancesByRoom(
      roomId,
      owner_id
    );

    if (!appliances || appliances.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No appliances found in this room",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      count: appliances.length,
      data: appliances,
    });
  } catch (error) {
    console.error("Error getting appliances by room:", error);
    return errorHandler.handle(res, error);
  }
};

// Get appliances by controller
export const getAppliancesByController = async (req, res) => {
  try {
    const { controllerId } = req.params;
    const owner_id = req.user?._id || req.query.owner_id;

    const appliances = await ApplianceService.getAppliancesByController(
      controllerId,
      owner_id
    );
    return res.status(200).json({
      status: "success",
      count: appliances.length,
      data: appliances,
    });
  } catch (error) {
    console.error("Error getting appliances by controller:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get appliances by device type
export const getAppliancesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const owner_id = req.user?._id || req.query.owner_id;

    const appliances = await ApplianceService.getAppliancesByType(
      type,
      owner_id
    );
    return res.status(200).json({
      status: "success",
      count: appliances.length,
      data: appliances,
    });
  } catch (error) {
    console.error("Error getting appliances by type:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
