import nodemailer from "nodemailer";

/**
 * Mail Service for Moonlight Machinery
 * Sends enquiry emails using nodemailer
 */

// Create transporter


/**
 * Send enquiry email to admin
 * @param {Object} enquiry - Enquiry data
 * @returns {Promise}
 */
export async function sendEnquiryEmail(enquiry) {
  const {
    name,
    phone,
    email,
    machine,
    message,
  } = enquiry;
  console.log(enquiry)

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.NEXT_APP_SMPT_USER,
        pass: process.env.NEXT_APP_SMPT_USER,
      },
    });

    // Email to admin
    const adminMailOptions = {
      from: process.NEXT_APP_SMPT_USER,
      to: process.NEXT_APP_SMPT_TO_USER,
      subject: `New Machine Enquiry from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">New Machine Enquiry</h2>
            
            <div style="margin-bottom: 15px;">
              <p style="color: #666; margin: 0;"><strong>Name:</strong> ${name}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Email:</strong> ${email || "Not provided"}</p>
              <p style="color: #666; margin: 5px 0;"><strong>Machine of Interest:</strong> ${machine}</p>
            </div>

            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #333; margin: 0;"><strong>Message:</strong></p>
              <p style="color: #666; margin: 10px 0; line-height: 1.6;">${message || "No message provided"}</p>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">This is an automated email from your website contact form.</p>
            </div>
          </div>
        </div>
      `,
      text: `
New Machine Enquiry

Name: ${name}
Phone: ${phone}
Email: ${email || "Not provided"}
Machine of Interest: ${machine}

Message:
${message || "No message provided"}
      `,
    };

    // Confirmation email to user
    const userMailOptions = {
      from: process.NEXT_APP_SMPT_USER,
      to: email || phone, // In case email is not provided, we still need to know where to send
      subject: "We received your enquiry - Moonlight Machinery",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Thank You, ${name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We've received your enquiry about the <strong>${machine}</strong> and will get back to you shortly.
            </p>

            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #333; margin: 0;"><strong>Your Enquiry:</strong></p>
              <p style="color: #666; margin: 10px 0; line-height: 1.6;">${message || "No additional message"}</p>
            </div>

            <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #333;">
              <p style="color: #333; margin: 0 0 10px 0;"><strong>Quick Contact Options:</strong></p>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li style="margin: 5px 0;">Call us at: +91 8178445596</li>
                <li style="margin: 5px 0;">WhatsApp: +918178445596</li>
                <li style="margin: 5px 0;">Email: sales@moonlightmachinery.com</li>
                <li style="margin: 5px 0;">Hours: Mon–Sat, 9am–7pm IST</li>
              </ul>
            </div>

            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              © 2024 Moonlight Machinery. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
Thank you, ${name}!

We've received your enquiry about the ${machine} and will get back to you shortly.

Your Enquiry:
${message || "No additional message"}

Quick Contact Options:
- Call us at: +91 8178445596
- WhatsApp: +918178445596
- Email: sales@moonlightmachinery.com
- Hours: Mon–Sat, 9am–7pm IST

© 2024 Moonlight Machinery. All rights reserved.
      `,
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);

    if (email) {
      await transporter.sendMail(userMailOptions);
    }

    return { success: true, message: "Enquiry sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}


/**
 * Moonlight Machinery
 * Query Email Service
 *
 * This service ONLY sends the query by email.
 * No database is used.
 */

export async function sendQueryEmail({
  customerName,
  customerContact,
  message,
  productName,
  productSku = "",
}) {
  if (!customerName || !customerContact || !productName) {
    throw new Error("Required enquiry details are missing");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,

      auth: {
        user: process.env.NEXT_APP_SMPT_USER,
        pass: process.env.NEXT_APP_SMPT_PASS,
      },
    });

    const adminMailOptions = {
      from: `"Moonlight Machinery" <${process.env.NEXT_APP_SMPT_USER}>`,
      to: process.env.NEXT_APP_SMPT_TO_USER,

      replyTo: process.env.NEXT_APP_SMPT_USER,

      subject: `New Product Query - ${productName}`,

      text: `
New Product Query - Moonlight Machinery

Customer Name:
${customerName}

Customer Contact:
${customerContact}

Product:
${productName}

Product SKU:
${productSku || "Not provided"}

Message:
${message || "No message provided"}

--------------------------------
This query was submitted from the Moonlight Machinery website.
            `,

      html: `
                <div style="
                    margin:0;
                    padding:30px 15px;
                    background:#f4f4f4;
                    font-family:Arial,Helvetica,sans-serif;
                ">

                    <div style="
                        max-width:650px;
                        margin:0 auto;
                        background:#ffffff;
                        border-radius:12px;
                        overflow:hidden;
                        border:1px solid #e5e5e5;
                    ">

                        <!-- Header -->
                        <div style="
                            padding:25px 30px;
                            background:#111111;
                            color:#ffffff;
                        ">
                            <h2 style="
                                margin:0;
                                font-size:24px;
                            ">
                                New Product Query
                            </h2>

                            <p style="
                                margin:8px 0 0;
                                color:#cccccc;
                                font-size:14px;
                            ">
                                Moonlight Machinery Website
                            </p>
                        </div>


                        <!-- Content -->
                        <div style="padding:30px;">

                            <h3 style="
                                margin:0 0 20px;
                                color:#222222;
                                font-size:18px;
                            ">
                                Customer Details
                            </h3>

                            <table style="
                                width:100%;
                                border-collapse:collapse;
                                font-size:14px;
                            ">

                                <tr>
                                    <td style="
                                        padding:12px 0;
                                        color:#777777;
                                        width:160px;
                                    ">
                                        <strong>Name</strong>
                                    </td>

                                    <td style="
                                        padding:12px 0;
                                        color:#222222;
                                    ">
                                        ${escapeHtml(customerName)}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:12px 0;
                                        color:#777777;
                                    ">
                                        <strong>Contact</strong>
                                    </td>

                                    <td style="
                                        padding:12px 0;
                                        color:#222222;
                                    ">
                                        ${escapeHtml(customerContact)}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:12px 0;
                                        color:#777777;
                                    ">
                                        <strong>Product</strong>
                                    </td>

                                    <td style="
                                        padding:12px 0;
                                        color:#222222;
                                        font-weight:600;
                                    ">
                                        ${escapeHtml(productName)}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:12px 0;
                                        color:#777777;
                                    ">
                                        <strong>SKU</strong>
                                    </td>

                                    <td style="
                                        padding:12px 0;
                                        color:#222222;
                                    ">
                                        ${escapeHtml(productSku || "Not provided")}
                                    </td>
                                </tr>

                            </table>


                            <!-- Message -->
                            <div style="
                                margin-top:25px;
                                padding:20px;
                                background:#f7f7f7;
                                border-radius:8px;
                                border:1px solid #eeeeee;
                            ">

                                <p style="
                                    margin:0 0 10px;
                                    color:#222222;
                                    font-weight:600;
                                ">
                                    Customer Message
                                </p>

                                <p style="
                                    margin:0;
                                    color:#666666;
                                    line-height:1.7;
                                    white-space:pre-line;
                                ">
                                    ${escapeHtml(message || "No message provided")}
                                </p>

                            </div>


                            <!-- Footer -->
                            <div style="
                                margin-top:25px;
                                padding-top:20px;
                                border-top:1px solid #eeeeee;
                            ">

                                <p style="
                                    margin:0;
                                    color:#999999;
                                    font-size:12px;
                                    line-height:1.6;
                                ">
                                    This is an automated query notification
                                    from the Moonlight Machinery website.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>
            `,
    };

    await transporter.sendMail(adminMailOptions);

    return {
      success: true,
      message: "Query sent successfully",
    };

  } catch (error) {
    console.error("Nodemailer query error:", error);

    throw new Error(
      error?.message || "Failed to send query email"
    );
  }
}

export async function sendCodOrderEmail(order) {
  const {
    orderNumber,
    customerName,
    customerPhone,
    customerEmail,
    address,
    city,
    state,
    postalCode,
    items,
    total,
  } = order;

  const itemLines = items
    .map(
      (item) =>
        `${item.name} (SKU: ${item.sku || "N/A"}) x ${item.quantity} — ₹${item.subtotal.toLocaleString("en-IN")}`,
    )
    .join("\n");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.NEXT_APP_SMPT_USER,
      pass: process.env.NEXT_APP_SMPT_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Moonlight Machinery" <${process.env.NEXT_APP_SMPT_USER}>`,
      to: process.env.NEXT_APP_SMPT_TO_USER,
      replyTo: customerEmail || undefined,
      subject: `New COD order ${orderNumber} — ${customerName}`,
      text: `New Cash on Delivery order ${orderNumber}\n\nCustomer: ${customerName}\nPhone: ${customerPhone}\nEmail: ${customerEmail || "Not provided"}\n\nDelivery address:\n${address}\n${city}, ${state} ${postalCode}, India\n\nItems:\n${itemLines}\n\nTotal: ₹${total.toLocaleString("en-IN")}\nPayment: Cash on Delivery`,
    });
  } catch (error) {
    console.error("Unable to send COD order email:", error);
    throw new Error("Unable to notify the store about this order.");
  }
}


/**
 * Escape user input before putting it inside HTML email.
 */
function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

