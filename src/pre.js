import './lib/patch-require.js'
// dprint-ignore
import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { WebClient } from '@slack/web-api'
import process from 'node:process'
import util from 'node:util'

export async function run () {
  const slackToken = core.getInput('slack-bot-token') ||
    process.env.SLACK_BOT_TOKEN
  const channelId = core.getInput('slack-channel-id') ||
    process.env.SLACK_CHANNEL_ID
  const slackTs = core.getInput('slack-ts')
  const githubToken = core.getInput('github-token', { required: true })
  const jobStatus = core.getInput('status', { required: true })
  const octokit = getOctokit(githubToken)
  const slack = new WebClient(slackToken)
  core.notice(JSON.stringify(context, null, 2))

  // await octokit.rest.actions.getWorkflow({
  //   ...context.repo,
  //   // workflow_id: context.workflow
  // })
}

run().catch(error => {
  core.info(util.format(error))
  if (error instanceof Error) core.setFailed(error.message)
  else core.setFailed('Unhandled error')
})
