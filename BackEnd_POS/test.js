const escpos = require('escpos');
// Ensure you have installed escpos-usb: npm install escpos-usb
escpos.USB = require('escpos-usb');

// Auto-find the first available USB printer
const device = new escpos.USB(); 
const printer = new escpos.Printer(device);

device.open((err) => {
    if (err) {
        console.error('Could not open printer:', err);
        return;
    }

    console.log('Printer connected. Starting test...');

    printer
        .font('b')
        .align('CT') // Center
        .size()
        .text('--- NODE.JS TEST ---')
        .text('If you see this, it works!')
        .feed(2)      // Feed 2 lines
        .cut()
        .close(() => {
            console.log('Print job finished and device closed.');
        });
});
