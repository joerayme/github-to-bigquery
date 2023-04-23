import * as ff from "@google-cloud/functions-framework";

const isValidRequest = async (request: ff.Request): Promise<boolean> => {
  return false;
};

ff.http("GitHubHandler", async (request, response) => {
  if (!(await isValidRequest(request))) {
    response.status(400).send({
      error: "Invalid request",
    });
  }
  response.status(200).send({
    message: "Hello World",
  });
});
