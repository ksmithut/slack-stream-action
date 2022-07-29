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
  core.info(JSON.stringify({ context, env: process.env }, null, 2))
  const runResponse = await octokit.rest.actions.getWorkflowRun({
    ...context.repo,
    run_id: context.runId
  })
  const workflowResponse = await octokit.rest.repos.getContent({
    ...context.repo,
    path: runResponse.data.path,
    ref: context.ref
  })
  const jobs = await octokit.paginate(
    octokit.rest.actions.listJobsForWorkflowRunAttempt,
    {
      ...context.repo,
      run_id: context.runId,
      attempt_number: Number.parseInt(process.env.GITHUB_RUN_ATTEMPT || '1', 10)
    }
  )
  core.info(JSON.stringify(workflowResponse.data, null, 2))
  core.info(JSON.stringify(jobs, null, 2))

  // await octokit.rest.actions.getWorkflow({
  //   ...context.repo,
  //   // workflow_id: context.workflow
  // })
}

run().catch(error => {
  core.error(util.format(error))
})
