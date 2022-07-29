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
    const info = [{
      label: 'Author',
      url: `https://github.com/${context.actor}`,
      value: context.actor
    }, {
      label: 'Workflow Run',
      url:
        `https://github.com/${context.repo.owner}/${context.repo.repo}/runs/${context.runId}`,
      value: context.action
    }]
    if (context.payload.repository?.html_url) {
      info.push({
        label: 'Repo',
        url: context.payload.repository.html_url,
        value: context.payload.repository.name
      })
    }
    if (context.payload.pull_request?.html_url) {
      info.push({
        label: 'PR',
        url: context.payload.pull_request.html_url,
        value: `#${context.payload.pull_request.number}`
      })
    }
    console.log(JSON.stringify(context, null, 2))
    const response = await slack.chat.postMessage({
      channel: channelId,
      blocks: [{
        block_id: 'info',
        type: 'context',
        elements: info.map(item => ({
          type: 'mrkdwn',
          text: `*${item.label}*\n<${item.url}|${item.label}>`
        }))
      }]
    })
    console.log(JSON.stringify(response, null, 2))
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
