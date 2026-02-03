import nodemailer from "nodemailer";
import { ENV } from "./env.js";

let cachedTransport = null;

const buildTransport = () => {
  if (cachedTransport) return cachedTransport;

  if (!ENV.SMTP_HOST || !ENV.SMTP_USER || !ENV.SMTP_PASS) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS.");
  }

  const port = ENV.SMTP_PORT ? parseInt(ENV.SMTP_PORT, 10) : 465;
  cachedTransport = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });

  return cachedTransport;
};

export const sendInviteEmail = async ({
  to,
  roomName,
  inviterName,
  roomLink,
  message,
}) => {
  const transport = buildTransport();
  const from = ENV.EMAIL_FROM || ENV.SMTP_USER;

  const subject = `${inviterName || "xHire"} invited you to join ${roomName}`;
  const text = `You're invited to join the room "${roomName}".\n\nJoin link: ${roomLink}\n\n${message || ""}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin: 0 0 12px;">You're invited to join ${roomName}</h2>
      <p><strong>${inviterName || "Someone"}</strong> invited you to a live collaboration session on xHire.</p>
      <p style="margin: 16px 0;">
        <a href="${roomLink}" style="background: #16a34a; color: white; text-decoration: none; padding: 10px 16px; border-radius: 8px; display: inline-block;">
          Join meeting
        </a>
      </p>
      <p>Or copy this link: <br /><a href="${roomLink}">${roomLink}</a></p>
      ${message ? `<p style="margin-top:12px;"><em>Message:</em> ${message}</p>` : ""}
    </div>
  `;

  await transport.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};
