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
    core.saveState('slack-ts', slackTs)
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
    const repoName = `${context.repo.owner}/${context.repo.repo}`
    const repoBaseURL = `https://github.com/${repoName}`
    const info = [{ label: 'Repo', url: repoBaseURL, value: repoName }, {
      label: 'Workflow',
      url: `${repoBaseURL}/actions/runs/${context.runId}`,
      value: context.workflow
    }, {
      label: 'Author',
      url: `https://github.com/${context.actor}`,
      value: context.actor
    }]
    if (context.payload.pull_request?.html_url) {
      info.push({
        label: 'PR',
        url: context.payload.pull_request.html_url,
        value: `#${context.payload.pull_request.number}`
      })
    }
    // console.log(JSON.stringify(context, null, 2))
    const response = await slack.chat.postMessage({
      channel: channelId,
      text: `${context.workflow}`,
      unfurl_links: false,
      blocks: [{
        block_id: 'info',
        type: 'context',
        elements: info.map(item => ({
          type: 'mrkdwn',
          text: `*${item.label}*     \n<${item.url}|${item.value}>     `
        }))
      }, { block_id: 'divider', type: 'divider' }]
    })
    if (!response.ts) {
      throw new Error('Did not get slack ts')
    }
    core.saveState('slack-ts', [channelId, response.ts].join(' '))
    console.log(JSON.stringify(jobs, null, 2))
  } else {
    throw new Error(`missing input slack-ts or channel-id`)
  }
  core.saveState('start', Date.now())

  // await octokit.rest.actions.getWorkflow({
  //   ...context.repo,
  //   // workflow_id: context.workflow
  // })
}

run().catch(error => {
  core.error(`ksmithut/slack-stream-action: ${util.format(error)}`)
})
