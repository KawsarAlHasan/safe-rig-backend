import { ICreateAccount, IResetPassword } from "../types/emailTamplate";

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: `${process.env.APP_NAME} - Email Verification Code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;
                  padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
        
        <p style="font-size: 15px; color: #555;">
          Welcome to <strong>${process.env.APP_NAME}</strong>! To complete your registration, 
          please enter the verification code below:
        </p>
        
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; 
                    text-align: center; border-radius: 6px;">
          <strong style="font-size: 26px; letter-spacing: 3px; color: #333;">
            ${values.otp}
          </strong>
        </div>
        
        <p style="font-size: 14px; color: #555;">
          This code will expire in <strong>5 minutes</strong>.
        </p>
        
        <p style="color: #666; font-size: 13px; margin-top: 25px;">
          If you didn’t request this, you can safely ignore this email or contact support at 
          <a href="mailto:${process.env.SUPPORT_EMAIL}" 
             style="color: #0073e6; text-decoration: none;">
             ${process.env.SUPPORT_EMAIL}
          </a>.
        </p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #333;">
          Thanks,<br>
          The ${process.env.APP_NAME} Team
        </p>
      </div>
    `,
    text: `
      Verify Your Email

      Welcome to ${process.env.APP_NAME}! 
      Your verification code is: ${values.otp}

      This code will expire in 5 minutes.

      If you didn’t request this, ignore this email or contact support: ${process.env.SUPPORT_EMAIL}

      Thanks,
      The ${process.env.APP_NAME} Team
    `,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: `${process.env.APP_NAME} - Password Reset Request`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>We received a request to reset your password for your ${process.env.APP_NAME} account.</p>
        
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; text-align: center;">
          <strong style="font-size: 24px; letter-spacing: 2px;">${values.otp}</strong>
        </div>
        
        <p>This verification code will expire in <strong>5 minutes</strong>.</p>
        
        <p style="color: #666; font-size: 14px;">
          If you didn't request this, please ignore this email or contact support at 
          <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.
        </p>
        
        <p>Thanks,<br>The ${process.env.APP_NAME} Team</p>
      </div>
    `,
    text: `
      Password Reset Request\n\n
      We received a request to reset your password for your ${process.env.APP_NAME} account.\n\n
      Your verification code is: ${values.otp}\n\n
      This code will expire in 5 minutes.\n\n
      If you didn't request this, please ignore this email.\n\n
      Thanks,\nThe ${process.env.APP_NAME} Team
    `,
  };
  return data;
};

const createCompany = (values: any) => {
  const data = {
    to: values.clientEmail,
    subject: `${process.env.APP_NAME} - Company Registration Verification`,
    html: `<div style=" font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px; overflow: hidden; "> <!-- Header --> <div style=" background: #111827; padding: 30px; text-align: center; "> <h1 style=" color: #ffffff; margin: 0; font-size: 28px; "> ${process.env.APP_NAME} </h1> <p style=" color: #d1d5db; margin-top: 10px; font-size: 14px; "> Company Registration Verification </p> </div> <!-- Body --> <div style="padding: 35px;"> <p style=" font-size: 16px; color: #374151; margin-bottom: 20px; "> Hello <strong>${values.clientName}</strong>, </p> <p style=" font-size: 15px; color: #4b5563; line-height: 1.7; "> A new company registration request has been submitted on <strong>${process.env.APP_NAME}</strong>. Please verify the request using the verification code below. </p> <!-- Company Info --> <div style=" background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; "> <h3 style=" margin-top: 0; margin-bottom: 15px; color: #111827; "> Company Details </h3> <p style="margin: 8px 0; color: #374151;"> <strong>Company Name:</strong> ${values.companyName} </p> <p style="margin: 8px 0; color: #374151;"> <strong>Company Email:</strong> ${values.companyEmail} </p> <p style="margin: 8px 0; color: #374151;"> <strong>Company Phone:</strong> ${values.companyPhone} </p> </div> <!-- OTP --> <div style=" text-align: center; margin: 35px 0; "> <p style=" font-size: 14px; color: #6b7280; margin-bottom: 12px; "> Your Verification Code </p> <div style=" display: inline-block; background: #111827; color: #ffffff; padding: 16px 35px; border-radius: 10px; font-size: 32px; letter-spacing: 6px; font-weight: bold; "> ${values.otp} </div> </div> <p style=" font-size: 14px; color: #ef4444; margin-top: 20px; "> This verification code will expire in <strong>5 minutes</strong>. </p> <p style=" font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 25px; "> If you did not request this registration, please ignore this email or contact our support team immediately at <a href="mailto:${process.env.SUPPORT_EMAIL}" style=" color: #2563eb; text-decoration: none; " > ${process.env.SUPPORT_EMAIL} </a>. </p> <p style=" margin-top: 35px; font-size: 15px; color: #374151; "> Best Regards,<br /> <strong>The ${process.env.APP_NAME} Team</strong> </p> </div> <!-- Footer --> <div style=" background: #f3f4f6; padding: 18px; text-align: center; font-size: 12px; color: #6b7280; "> © ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved. </div> </div> `,
    text: `Company Registration Verification Hello ${values.clientName}, A new company registration request has been submitted on ${process.env.APP_NAME}. Company Details: - Company Name: ${values.companyName} - Company Email: ${values.companyEmail} - Company Phone: ${values.companyPhone} Your verification code is: ${values.otp} This code will expire in 5 minutes. If you did not request this registration, please contact support: ${process.env.SUPPORT_EMAIL} Best Regards, The ${process.env.APP_NAME} Team `,
  };
  return data;
};

const immediateActionEmail = (values: any) => {
  const data = {
    to: values.email,
    subject: `${process.env.APP_NAME} - Immediate Action Required`,
    html: ``,
    text: ``,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  createCompany,
  immediateActionEmail,
};
