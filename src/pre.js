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
  const slackTs = core.getInput('slack-ts')
  const channelId = core.getInput('slack-channel-id')
  const jobStatus = core.getInput('status', { required: true })
  const githubToken = core.getInput('github-token', { required: true })

  const octokit = getOctokit(githubToken)
  const slack = new WebClient(slackToken)

  if (!slackToken) {
    throw new Error(
      'Missing input slack-bot-token or environment variable SLACK_BOT_TOKEN'
    )
  }

  if (slackTs) {
  } else if (channelId) {
    const jobs = await octokit.paginate(
      octokit.rest.actions.listJobsForWorkflowRunAttempt,
      {
        ...context.repo,
        run_id: context.runId,
        attempt_number: Number.parseInt(
          process.env.GITHUB_RUN_ATTEMPT || '1',
          10
        )
      }
    )
    core.info(JSON.stringify(jobs, null, 2))
  } else {
    throw new Error(`missing input slack-ts or channel-id`)
  }

  // await octokit.rest.actions.getWorkflow({
  //   ...context.repo,
  //   // workflow_id: context.workflow
  // })
}

run().catch(error => {
  core.error(util.format(error))
})
