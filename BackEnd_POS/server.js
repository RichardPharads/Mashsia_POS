const express = require('express');
const usb = require('usb');
if (!usb.getDeviceList) { Object.assign(usb, usb.usb); } 

const escpos = require('escpos');
const { default: sortItems } = require('./utils/sortItems');
escpos.USB = require('escpos-usb');

const app = express();
app.use(express.json());

app.post('/print', (req, res) => {
    const data = req.body;
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    const LINE = '-'.repeat(32);

    // helper: right align text
    

    // ==== CALCULATIONS ====
    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.12; // 12% VAT
    const tax = parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));
    const timestamp = data.timestamp || new Date().toISOString();
    const today = new Date();
    const month = today.getMonth() + 1; 
    const day = today.getDate();
    const year = today.getFullYear();
    const formattedDate = `${month}/${day}/${year}`; 
    
    device.open((err) => {
        if (err) return res.status(500).send(err);

        const orderNumber = data.orderId.slice(6);
        const time = new Date(timestamp).toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const currentDate = (time + " " + formattedDate)
       
        printer
            .font('b')
            .align('ct')
            .style('b')
            .text('MASHSIA CAFE')
            .style('normal')
            .text(`- ${data.customer.type.toUpperCase()} -`)
            .text(`#${orderNumber}`)
            .text(currentDate)

            .text(LINE)
            .align('lt');

        // ===== ITEMS =====
            
            // Sort items so items starting with "COF" come first
   // Helper function to align text right
function right(leftText, rightText, width = 40) {
    const space = width - leftText.length - rightText.length;
    return leftText + ' '.repeat(space > 0 ? space : 1) + rightText;
  }
  
  // Sort items: COF first, then others

  const sortedItems = sortItems(data.items, "COF" , "productId")
  console.log(sortedItems)
  
  sortedItems.forEach(item => {
    printer.style('b').text(item.name + (item.size ? ` (${item.size})` : ''));
    printer.style('normal');
  
    // Customizations
    const mods = Object.values(item.customizations || {});
    if (mods.length) {
      printer.text('  ' + mods.join(' - '));
    }
  
    // Qty x Price = Total
    const calc = `${item.qty} x ${item.price}`;
    const totalItem = item.total.toFixed(0);
  
    printer.text(right(calc, totalItem));
  });

        // ===== TOTALS =====
        printer
            .text(right('Subtotal', subtotal.toFixed(2)))
            .text(right('Tax (12%)', tax.toFixed(2)))
            .feed(1)
            .style('b')
            .text(right('TOTAL', total.toFixed(2)))
            .style('normal')
            .text(`Paid via ${data.paymentMethod || 'Cash'}`)
            .feed(1)
            .align('CT')
            .text(LINE)
            .text('Enjoy your coffee')
            .feed(1)
            .cut()
            .close();

        res.send({ status: "Printed", subtotal, tax, total });
    });
});

app.listen(3000, () => console.log('Printer server running on port 3000'));