import { NextRequest, NextResponse } from "next/server";
import { ResponseDto } from "@/app/api/response.dto";
import { getAllAdminUsers } from "@/app/api/adminUtils/user.admin";
import {
  sendContactNotificationToAdmins,
  ContactEmailData,
} from "../utils/email.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !message) {
      return ResponseDto.createErrorResponse(
        "All fields are required: firstName, lastName, email, phone, message",
        { statusCode: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ResponseDto.createErrorResponse(
        "Please provide a valid email address",
        { statusCode: 400 }
      );
    }

    // Validate phone format (basic validation for Nigerian phone numbers)
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return ResponseDto.createErrorResponse(
        "Please provide a valid phone number",
        { statusCode: 400 }
      );
    }

    // Get all admin users
    const adminUsers = await getAllAdminUsers();

    if (adminUsers.length === 0) {
      console.warn("No admin users found to send contact notification");
      return ResponseDto.createErrorResponse(
        "Unable to process contact form at this time. Please try again later.",
        { statusCode: 500 }
      );
    }

    // Prepare email data
    const contactData: ContactEmailData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
    };

    // Get admin email addresses
    const adminEmails = adminUsers.map((admin) => admin.email);

    console.log(
      `Sending contact notification to ${adminEmails.length} admins:`,
      adminEmails
    );

    // Send notification emails to all admins
    const emailSent = await sendContactNotificationToAdmins(
      contactData,
      adminEmails
    );

    if (!emailSent) {
      console.error("Failed to send contact notification emails");
      return ResponseDto.createErrorResponse(
        "Message received but notification email failed. Our team will still review your message.",
        { statusCode: 207 } // Partial success
      );
    }

    console.log("Contact form submission processed successfully");

    return ResponseDto.createSuccessResponse(
      "Thank you for contacting us! We'll get back to you within 24 hours.",
      {
        submittedAt: new Date().toISOString(),
        notifiedAdmins: adminEmails.length,
      }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return ResponseDto.createErrorResponse(
      "An error occurred while processing your message. Please try again later.",
      { statusCode: 500 }
    );
  }
}
