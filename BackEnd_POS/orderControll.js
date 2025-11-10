import escpos from 'escpos';
import usb from 'escpos-usb';

escpos.USB = usb;

const printReceipt = (order) => {
  const device = new escpos.USB();
  const printer = new escpos.Printer(device);

  device.open(() => {
    printer.align('ct').style('b').text('Mashsia POS');
    printer.text('Order ID: ' + order._id);
    printer.text('-------------------------');

    order.items.forEach(item => {
      printer.text(`${item.name} .... ₱${item.price}`);
    });

    printer.text('-------------------------');
    printer.text(`TOTAL: ₱${order.total}`);
    printer.cut().close();
  });
};
export default { printReceipt };