
const passwordResetEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forget Password</title>
</head>
<body style="font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="text-align: center;">OTP For Resetting Password</h2>
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
            <p>Your OTP for Resetting Password is <strong>{{OTP}}</strong>.</p>
            <p>Please ignore if you haven't requested this.</p>
        </div>
    </div>
</body>
</html>
`;

const preparingTemplate = (order) => {
    const orderItemsTable = `
        <table style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Image</th>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Name</th>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Price</th>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${order.orderItems
                    .map(
                        (item) => `
                            <tr>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><img src="${item.image}" alt="${item.name}" style="max-width: 100px;"></td>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.name}</td>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.price}</td>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.quantity}</td>
                            </tr>
                        `
                    )
                    .join("")}
            </tbody>
        </table>
    `;

    return `
        <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Your Order is Being Prepared</h2>
            <p>Dear Customer,</p>
            <p>Your order with ID ${order._id} is now being prepared and will be shipped soon.</p>
            <p>Order Items:</p>
            ${orderItemsTable}
            <p>Overall Price: $${order.totalAmount}</p>
            <p>Shipping Address: ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.country} - ${order.shippingInfo.pinCode}</p>
            <img src="https://img.freepik.com/free-vector/gradient-quill-pen-logo-with-tagline-template_23-2149813051.jpg" alt="Order Image" style="max-width: 30%; height: auto;">
            <p>Thank you for shopping with us.</p>
        </div>
    `;
};

const shippedTemplate = (order) => {
    const orderItemsTable = `
        <table style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Image</th>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Name</th>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Price</th>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${order.orderItems
                    .map(
                        (item) => `
                            <tr>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><img src="${item.image}" alt="${item.name}" style="max-width: 100px;"></td>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.name}</td>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.price}</td>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.quantity}</td>
                            </tr>
                        `
                    )
                    .join("")}
            </tbody>
        </table>
    `;

    return `
        <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Your Order is Being Shipped</h2>
            <p>Dear Customer,</p>
            <p>Your order with ID ${order._id} is now being shipped and will be delivered soon.</p>
            <p>Order Items:</p>
            ${orderItemsTable}
            <p>Overall Price: $${order.totalAmount}</p>
            <p>Shipping Address: ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.country} - ${order.shippingInfo.pinCode}</p>
            <img src="https://img.freepik.com/free-vector/gradient-quill-pen-logo-with-tagline-template_23-2149813051.jpg" alt="Order Image" style="max-width: 30%; height: auto;">
            <p>Thank you for shopping with us.</p>
        </div>
    `;
};

const deliveredTemplate = (order) => {
    const orderItemsTable = `
        <table style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Image</th>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Name</th>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Price</th>
                    <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${order.orderItems
                    .map(
                        (item) => `
                            <tr>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"><img src="${item.image}" alt="${item.name}" style="max-width: 100px;"></td>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.name}</td>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.price}</td>
                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.quantity}</td>
                            </tr>
                        `
                    )
                    .join("")}
            </tbody>
        </table>
    `;

    return `
        <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2>Your Order is Delivered</h2>
            <p>Dear Customer,</p>
            <p>Your order with ID ${order._id} has been delivered successfully.</p>
            <p>Order Items:</p>
            ${orderItemsTable}
            <p>Overall Price: $${order.totalAmount}</p>
            <p>Shipping Address: ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.country} - ${order.shippingInfo.pinCode}</p>
            <img src="https://img.freepik.com/free-vector/gradient-quill-pen-logo-with-tagline-template_23-2149813051.jpg" alt="Order Image" style="max-width: 30%; height: auto;">
            <p>Thank you for shopping with us.</p>
        </div>
    `;
};


export { passwordResetEmailTemplate, preparingTemplate, shippedTemplate, deliveredTemplate  };
