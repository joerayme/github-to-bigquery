import * as ff from "@google-cloud/functions-framework";
import { createHmac, timingSafeEqual } from "node:crypto";

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const ACCEPTED_EVENTS = ["pull_request"];

const isValidRequest = (request: ff.Request): boolean => {
  const signature = createHmac("sha256", GITHUB_WEBHOOK_SECRET!)
    .update(request.rawBody!)
    .digest("hex");

  return timingSafeEqual(
    Buffer.from(request.header("x-hub-signature-256")!),
    Buffer.from(`sha256=${signature}`)
  );
};

ff.http("GitHubHandler", async (request, response) => {
  if (!isValidRequest(request)) {
    return response.status(400).send({
      error: "Invalid request",
    });
  }
  response.status(200).send({
    message: "Hello World",
  });
});
