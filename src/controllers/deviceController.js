import Device from "../models/device.model.js";

const createDevice = async (req, res) => {
  const data = req.body;
  await Device.create(data);
  return res.send("success");
};

const getDevices = async (req, res) => {
  const devices = await Device.find();
  console.log(devices);
  return res.json({ status: "success" });
};

export { createDevice, getDevices };
