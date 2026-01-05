import IrCode from "../models/irCodeModel.js";

class IrCodeService {
  // Create new IR code (Detail populate)
  static async createIrCode(irCodeData) {
    const irCode = await IrCode.create(irCodeData);
    // Return populated object like Detail endpoint
    return await IrCode.findById(irCode._id).populate("owner_id", "username email");
  }

  // Get all IR codes for a user (personal library) (List - Light populate)
  static async getIrCodesByOwner(ownerId) {
    const irCodes = await IrCode.find({ owner_id: ownerId })
      .populate("owner_id", "username")
      .sort({ created_at: -1 });
    return irCodes;
  }

  // Get public IR codes (library chung)
  static async getPublicIrCodes() {
    const irCodes = await IrCode.find({ owner_id: null }).sort({
      created_at: -1,
    });
    return irCodes;
  }

  // Get single IR code by ID (Detail - Full populate)
  static async getIrCodeById(irCodeId) {
    const irCode = await IrCode.findById(irCodeId).populate(
      "owner_id",
      "username email"
    );
    return irCode;
  }

  // Update IR code (Detail populate)
  static async updateIrCode(irCodeId, ownerId, updateData) {
    // Only owner can update their own codes
    const irCode = await IrCode.findOneAndUpdate(
      { _id: irCodeId, owner_id: ownerId },
      updateData,
      { new: true, runValidators: true }
    ).populate("owner_id", "username email");
    return irCode;
  }

  // Delete IR code
  static async deleteIrCode(irCodeId, ownerId) {
    const irCode = await IrCode.findOneAndDelete({
      _id: irCodeId,
      owner_id: ownerId,
    });
    return irCode;
  }

  // Search IR codes by brand and device type
  static async searchIrCodes(filters) {
    const { brand, device_type, action, owner_id } = filters;
    const query = {};

    if (brand) query.brand = new RegExp(brand, "i");
    if (device_type) query.device_type = device_type;
    if (action) query.action = new RegExp(action, "i");

    // Get both user's codes and public codes
    const userCodes = owner_id
      ? await IrCode.find({ ...query, owner_id })
      : [];
    const publicCodes = await IrCode.find({ ...query, owner_id: null });

    return [...userCodes, ...publicCodes];
  }

  // Get IR codes by brand
  static async getIrCodesByBrand(brand, ownerId = null) {
    const query = { brand: new RegExp(brand, "i") };
    if (ownerId) {
      // Get both user's codes and public codes
      const userCodes = await IrCode.find({ ...query, owner_id: ownerId });
      const publicCodes = await IrCode.find({ ...query, owner_id: null });
      return [...userCodes, ...publicCodes];
    }
    return await IrCode.find({ ...query, owner_id: null });
  }

  // Get IR codes by device type
  static async getIrCodesByDeviceType(deviceType, ownerId = null) {
    const query = { device_type: deviceType };
    if (ownerId) {
      const userCodes = await IrCode.find({ ...query, owner_id: ownerId });
      const publicCodes = await IrCode.find({ ...query, owner_id: null });
      return [...userCodes, ...publicCodes];
    }
    return await IrCode.find({ ...query, owner_id: null });
  }

  // Get IR codes with IDs and actions for device type
  static async getIrCodesWithActions(deviceType, brand = null) {
    console.log(deviceType + brand);
    const query = {
      device_type: new RegExp(deviceType, "i"),  // Tìm kiếm không phân biệt hoa thường cho deviceType
      brand: new RegExp(brand, "i")  // Tìm kiếm không phân biệt hoa thường cho brand
    };
    const irCodes = await IrCode.find(query)
      .select("_id action brand protocol")
      .sort({ action: 1 });
    return irCodes;
  }

  // Get available actions for a device type
  static async getActionsByDeviceType(deviceType, brand = null) {
    const query = { device_type: deviceType };
    if (brand) query.brand = new RegExp(brand, "i");

    const actions = await IrCode.distinct("action", query);
    return actions;
  }
}

export default IrCodeService;
