const { usb } = require('usb');

// Find a specific device by VendorID and ProductID
const device = usb.findByIds(0x1234, 0x5678);

if (device) {
  device.open();
  // Perform control transfers or claim interfaces here
  console.log("Device opened successfully");
  device.close();
}