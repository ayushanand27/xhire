const CRLF = Buffer.from("\r\n");
const HEADER_SEPARATOR = Buffer.from("\r\n\r\n");

function splitBuffer(buffer, delimiter) {
  const parts = [];
  let start = 0;
  let index;

  while ((index = buffer.indexOf(delimiter, start)) !== -1) {
    parts.push(buffer.slice(start, index));
    start = index + delimiter.length;
  }

  parts.push(buffer.slice(start));
  return parts;
}

function parseHeaders(headerBlock) {
  const headers = {};
  const lines = headerBlock.split("\r\n");

  for (const line of lines) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();
    headers[key] = value;
  }

  return headers;
}

export const parseMultipartForm = async (req, res, next) => {
  try {
    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

    if (!contentType.startsWith("multipart/form-data") || !boundaryMatch) {
      return res.status(400).json({ error: "Expected multipart/form-data upload" });
    }

    const boundaryToken = boundaryMatch[1] || boundaryMatch[2];
    const boundary = Buffer.from(`--${boundaryToken}`);
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const body = Buffer.concat(chunks);
    const rawParts = splitBuffer(body, boundary);

    req.body = req.body || {};

    for (const rawPart of rawParts) {
      let part = rawPart;

      if (!part.length) continue;
      if (part.slice(0, 2).equals(CRLF)) {
        part = part.slice(2);
      }
      if (!part.length || part.equals(Buffer.from("--")) || part.slice(0, 2).equals(Buffer.from("--"))) {
        continue;
      }

      const separatorIndex = part.indexOf(HEADER_SEPARATOR);
      if (separatorIndex === -1) continue;

      const headerText = part.slice(0, separatorIndex).toString("utf8");
      let content = part.slice(separatorIndex + HEADER_SEPARATOR.length);

      if (content.slice(-2).equals(CRLF)) {
        content = content.slice(0, -2);
      }

      const headers = parseHeaders(headerText);
      const disposition = headers["content-disposition"] || "";
      const nameMatch = disposition.match(/name="([^"]+)"/i);
      const filenameMatch = disposition.match(/filename="([^"]*)"/i);
      const fieldName = nameMatch?.[1];

      if (!fieldName) continue;

      if (filenameMatch) {
        req.file = {
          fieldname: fieldName,
          originalname: filenameMatch[1] || "upload.pdf",
          mimetype: headers["content-type"] || "application/octet-stream",
          buffer: content,
          size: content.length,
        };
      } else {
        req.body[fieldName] = content.toString("utf8");
      }
    }

    return next();
  } catch (error) {
    console.error("Error parsing multipart form:", error);
    return res.status(500).json({ error: "Failed to parse upload" });
  }
};