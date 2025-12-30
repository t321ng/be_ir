import IrCodeService from "../services/irCodeService.js";
import { errorHandler } from "../utils/errorHandler.js";

// Create new IR code
export const createIrCode = async (req, res) => {
  try {
    const {
      brand,
      device_type,
      action,
      protocol,
      frequency,
      bits,
      raw_data,
      data,
    } = req.body;

    // Luôn lấy owner_id từ JWT (nếu có). null = public library
    const owner_id = req.user?._id || null;

    // Validate required fields
    if (!action || action.trim() === "") {
      return errorHandler.missingField(res, "Action");
    }

    if (!protocol || protocol.trim() === "") {
      return errorHandler.missingField(res, "Protocol");
    }

    const irCodeData = {
      owner_id,
      brand,
      device_type,
      action: action.trim(),
      protocol,
      frequency,
      bits,
      raw_data,
      data,
    };

    const irCode = await IrCodeService.createIrCode(irCodeData);
    return res.status(201).json({
      status: "success",
      message: "IR code created successfully",
      data: irCode,
    });
  } catch (error) {
    console.error("Error creating IR code:", error);
    return errorHandler.handle(res, error);
  }
};

// Get IR codes for current user
export const getIrCodes = async (req, res) => {
  try {
    const owner_id = req.user?._id;

    if (!owner_id) {
      // Return only public codes if no owner specified
      const publicCodes = await IrCodeService.getPublicIrCodes();

      if (!publicCodes || publicCodes.length === 0) {
        return res.status(200).json({
          status: "success",
          message: "No public IR codes found",
          count: 0,
          data: [],
        });
      }

      return res.status(200).json({
        status: "success",
        count: publicCodes.length,
        data: publicCodes,
      });
    }

    const irCodes = await IrCodeService.getIrCodesByOwner(owner_id);

    if (!irCodes || irCodes.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No IR codes found",
        count: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      count: irCodes.length,
      data: irCodes,
    });
  } catch (error) {
    console.error("Error getting IR codes:", error);
    return errorHandler.handle(res, error);
  }
};

// Get public IR codes (library)
export const getPublicIrCodes = async (req, res) => {
  try {
    const publicCodes = await IrCodeService.getPublicIrCodes();
    return res.status(200).json({
      status: "success",
      count: publicCodes.length,
      data: publicCodes,
    });
  } catch (error) {
    console.error("Error getting public IR codes:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get single IR code by ID
export const getIrCodeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "IR Code ID");
    }

    const irCode = await IrCodeService.getIrCodeById(id);

    if (!irCode) {
      return errorHandler.notFound(res, "IR Code");
    }

    return res.status(200).json({
      status: "success",
      data: irCode,
    });
  } catch (error) {
    console.error("Error getting IR code:", error);
    return errorHandler.handle(res, error);
  }
};

// Update IR code
export const updateIrCode = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user?._id || req.body.owner_id;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "IR Code ID");
    }

    if (!owner_id) {
      return errorHandler.missingField(res, "Owner ID");
    }

    const allowedUpdates = [
      "brand",
      "device_type",
      "action",
      "protocol",
      "frequency",
      "bits",
      "raw_data",
      "data",
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

    const irCode = await IrCodeService.updateIrCode(id, owner_id, updateData);

    if (!irCode) {
      return errorHandler.notFound(res, "IR Code");
    }

    return res.status(200).json({
      status: "success",
      message: "IR code updated successfully",
      data: irCode,
    });
  } catch (error) {
    console.error("Error updating IR code:", error);
    return errorHandler.handle(res, error);
  }
};

// Delete IR code
export const deleteIrCode = async (req, res) => {
  try {
    const { id } = req.params;
    const owner_id = req.user?._id || req.body.owner_id;

    if (!id || id.trim() === "") {
      return errorHandler.missingField(res, "IR Code ID");
    }

    if (!owner_id) {
      return errorHandler.missingField(res, "Owner ID");
    }

    const irCode = await IrCodeService.deleteIrCode(id, owner_id);

    if (!irCode) {
      return errorHandler.notFound(res, "IR Code");
    }

    return res.status(200).json({
      status: "success",
      message: "IR code deleted successfully",
      data: irCode,
    });
  } catch (error) {
    console.error("Error deleting IR code:", error);
    return errorHandler.handle(res, error);
  }
};

// Search IR codes
export const searchIrCodes = async (req, res) => {
  try {
    const { brand, device_type, action } = req.query;
    const owner_id = req.user?._id || req.query.owner_id;

    const filters = {
      brand,
      device_type,
      action,
      owner_id,
    };

    const irCodes = await IrCodeService.searchIrCodes(filters);
    return res.status(200).json({
      status: "success",
      count: irCodes.length,
      data: irCodes,
    });
  } catch (error) {
    console.error("Error searching IR codes:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get IR codes by brand
export const getIrCodesByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    const owner_id = req.user?._id || req.query.owner_id;

    const irCodes = await IrCodeService.getIrCodesByBrand(brand, owner_id);
    return res.status(200).json({
      status: "success",
      count: irCodes.length,
      data: irCodes,
    });
  } catch (error) {
    console.error("Error getting IR codes by brand:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get IR codes by device type
export const getIrCodesByDeviceType = async (req, res) => {
  try {
    const { type } = req.params;
    const owner_id = req.user?._id || req.query.owner_id;

    const irCodes = await IrCodeService.getIrCodesByDeviceType(type, owner_id);
    return res.status(200).json({
      status: "success",
      count: irCodes.length,
      data: irCodes,
    });
  } catch (error) {
    console.error("Error getting IR codes by device type:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get available actions for device type
export const getActionsByDeviceType = async (req, res) => {
  try {
    const { type } = req.params;
    const { brand } = req.query;

    const actions = await IrCodeService.getActionsByDeviceType(type, brand);
    return res.status(200).json({
      status: "success",
      count: actions.length,
      data: actions,
    });
  } catch (error) {
    console.error("Error getting actions by device type:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
