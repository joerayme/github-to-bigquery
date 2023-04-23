import * as ff from "@google-cloud/functions-framework";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PullRequestData, savePullRequest } from "./storage";

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const BIGQUERY_DATASET = "github";
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

const getDate = (date: string): string | undefined => {
  return date ? date.replace(/Z$/, "") : undefined;
};

const getDataFromBody = (body: any): PullRequestData | null => {
  if (body.action !== "closed" || !body.pull_request) {
    console.log("Pull request is not closed or does not contain any data");
    return null;
  }

  return {
    author: body.pull_request.user.login,
    title: body.pull_request.title,
    url: body.pull_request.url,
    id: body.pull_request.id,
    repository: body.repository.full_name,
    merged: body.pull_request.merged,
    created_at: getDate(body.pull_request.created_at),
    merged_at: getDate(body.pull_request.merged_at),
    merged_by: body.pull_request.merged_by?.login,
    additions: body.pull_request.additions,
    changed_files: body.pull_request.changed_files,
    comments: body.pull_request.comments,
    deletions: body.pull_request.deletions,
    review_comments: body.pull_request.review_comments,
  };
};

ff.http("GitHubHandler", async (request, response) => {
  if (!isValidRequest(request)) {
    return response.status(400).send({
      error: "Invalid request",
    });
  }

  const event = request.header("x-github-event")!;

  console.log(`Processing ${event}`);

  if (event == "ping") {
    return response.status(200).send({
      message: "Pong",
    });
  }

  if (!ACCEPTED_EVENTS.includes(event)) {
    return response.status(404).send({
      message: "This event type is not supported",
    });
  }

  const data = getDataFromBody(JSON.parse(request.rawBody!.toString()));

  try {
    if (data) {
      await savePullRequest(data, BIGQUERY_DATASET);
    }

    return response.status(200).send();
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error stack: ", e.stack);
    }
    console.error("Error: ", e);
    return response.status(500).send();
  }
});
