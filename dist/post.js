import {
  __toESM,
  require_core
} from "./chunk-RLY2MMZ7.js";

// src/post.js
var core = __toESM(require_core(), 1);
import process from "node:process";
import util from "node:util";
async function run() {
  const slackToken = core.getInput("slack-bot-token") || process.env.SLACK_BOT_TOKEN;
  const channelId = core.getInput("slack-channel-id") || process.env.SLACK_CHANNEL_ID;
  const slackTs = core.getInput("slack-ts");
  const githubToken = core.getInput("github-token", { required: true });
  const jobStatus = core.getInput("status", { required: true });
  core.notice(jobStatus);
}
run().catch((error) => {
  core.info(util.format(error));
  if (error instanceof Error)
    core.setFailed(error.message);
  else
    core.setFailed("Unhandled error");
});
export {
  run
};
