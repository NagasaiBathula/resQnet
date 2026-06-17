import { defineEventHandler, readRawBody, getHeaders } from "h3";
import app, { initDB } from "../server/src/app.js";
import { Readable, Stream } from "stream";
import EventEmitter from "events";

let dbConnected = false;

// Custom MockRequest simulating Node.js IncomingMessage
class MockRequest extends Readable {
  url: string;
  method: string;
  headers: Record<string, string>;
  rawHeaders: string[];
  body: any;
  socket: Stream & { remoteAddress: string };

  constructor(url: string, method: string, headers: Record<string, string>, bodyText: string) {
    super();
    this.url = url;
    this.method = method;
    this.headers = { ...headers };
    
    // Create a real Stream instance for the socket to satisfy 'instanceof Stream' check in eos
    const mockSocket = new Stream();
    (mockSocket as any).remoteAddress = "127.0.0.1";
    (mockSocket as any).destroy = () => {};
    this.socket = mockSocket as any;

    // Try to parse body if it is JSON
    if (bodyText) {
      try {
        this.body = JSON.parse(bodyText);
      } catch {
        this.body = bodyText;
      }
    } else {
      this.body = {};
    }

    // Adjust content-length and content-encoding headers to match the uncompressed body text
    if (bodyText) {
      const bodyBuffer = Buffer.from(bodyText);
      this.headers["content-length"] = String(bodyBuffer.length);
      delete this.headers["content-encoding"];
      
      // Push body data to the stream so body-parser can read it
      this.push(bodyBuffer);
    } else {
      this.headers["content-length"] = "0";
      delete this.headers["content-encoding"];
    }
    this.push(null); // EOF

    // Construct rawHeaders array from the adjusted headers
    this.rawHeaders = [];
    for (const [key, value] of Object.entries(this.headers)) {
      this.rawHeaders.push(key, value);
    }
  }
}

// Custom MockResponse simulating Node.js ServerResponse
class MockResponse extends EventEmitter {
  statusCode: number = 200;
  headers: Record<string, string | string[]> = {};
  body: Buffer[] = [];
  finished: boolean = false;

  // We define these as instance properties so they are not overridden
  // when Express calls Object.setPrototypeOf(res, app.response)
  setHeader: (name: string, value: string | string[]) => this;
  getHeader: (name: string) => string | string[] | undefined;
  getHeaders: () => Record<string, string | string[]>;
  hasHeader: (name: string) => boolean;
  removeHeader: (name: string) => void;
  writeHead: (statusCode: number, headers?: any) => this;
  write: (chunk: any) => boolean;
  end: (chunk?: any) => void;

  constructor(private resolve: (res: Response) => void) {
    super();

    this.setHeader = (name: string, value: string | string[]) => {
      this.headers[name.toLowerCase()] = value;
      return this;
    };

    this.getHeader = (name: string) => {
      return this.headers[name.toLowerCase()];
    };

    this.getHeaders = () => {
      return { ...this.headers };
    };

    this.hasHeader = (name: string) => {
      return this.headers[name.toLowerCase()] !== undefined;
    };

    this.removeHeader = (name: string) => {
      delete this.headers[name.toLowerCase()];
    };

    this.writeHead = (statusCode: number, headers?: any) => {
      this.statusCode = statusCode;
      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          this.setHeader(key, value as any);
        }
      }
      return this;
    };

    this.write = (chunk: any) => {
      if (chunk) {
        this.body.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return true;
    };

    this.end = (chunk: any) => {
      if (chunk) {
        this.write(chunk);
      }
      this.finished = true;
      
      // Convert headers to Fetch Headers
      const responseHeaders = new Headers();
      for (const [key, value] of Object.entries(this.headers)) {
        if (Array.isArray(value)) {
          value.forEach(v => responseHeaders.append(key, v));
        } else {
          responseHeaders.set(key, String(value));
        }
      }

      const hasNoBody = [204, 205, 304].includes(this.statusCode);
      const responseBody = hasNoBody ? null : Buffer.concat(this.body);
      const fetchResponse = new Response(responseBody, {
        status: this.statusCode,
        headers: responseHeaders,
      });

      this.emit("finish");
      this.resolve(fetchResponse);
    };
  }
}

export default defineEventHandler(async (event) => {
  // Lazy connect DB
  if (!dbConnected || mongoose.connection.readyState === 0) {
    try {
      await initDB();
      dbConnected = true;
    } catch (err) {
      dbConnected = false;
      console.error("Vercel lazy-connect DB error:", err);
    }
  }

  const pathWithQuery = event.path || "/";
  const method = (event.method || "GET").toUpperCase();

  // Convert Web Headers to Record
  const headers = getHeaders(event);
  const requestHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      requestHeaders[key] = Array.isArray(value) ? value.join(", ") : String(value);
    }
  }

  // Read request body as text
  let bodyText = "";
  if (method !== "GET" && method !== "HEAD") {
    try {
      bodyText = (await readRawBody(event, "utf-8")) || "";
    } catch (err) {
      console.error("Error reading raw body in event handler:", err);
    }
  }

  // Await Express response completion via Promise
  return new Promise<Response>((resolve) => {
    const req = new MockRequest(pathWithQuery, method, requestHeaders, bodyText) as any;
    const res = new MockResponse(resolve) as any;

    // Run Express app
    app(req, res, (err?: any) => {
      if (err) {
        console.error("Express routing error in adapter:", err);
        resolve(new Response(JSON.stringify({ error: "Express Error", message: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }));
      } else {
        resolve(new Response(JSON.stringify({ error: "Not Found", message: `Express route not found: ${pathWithQuery}` }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }));
      }
    });
  });
});
