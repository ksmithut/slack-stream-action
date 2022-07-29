import './lib/patch-require.js'
// dprint-ignore
import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { WebClient } from '@slack/web-api'
import process from 'node:process'
import util from 'node:util'
import { getInfoBlock, getJobsStatusBlock } from './lib/messages.js'

export async function run () {
  const slackToken = core.getInput('slack-bot-token') ||
    process.env.SLACK_BOT_TOKEN
  const slackTs = core.getInput('slack-ts')
  const channelId = core.getInput('slack-channel-id') ||
    process.env.SLACK_CHANNEL_ID
  const githubToken = core.getInput('github-token', { required: true })

  const octokit = getOctokit(githubToken)
  const slack = new WebClient(slackToken)

  if (!slackToken) {
    throw new Error(
      'Missing input slack-bot-token or environment variable SLACK_BOT_TOKEN'
    )
  }
  if (!channelId) {
    throw new Error(
      'Missing input slack-channel-id or environment variable SLACK_CHANNEL_ID'
    )
  }

  if (slackTs) {
    const { mainBlock, threadBlock, jobLabel } = await getJobsStatusBlock(
      octokit,
      context
    )
    const [mainMessage, threadMessage] = await Promise.all([
      slack.chat.update({
        channel: channelId,
        ts: slackTs,
        text: context.workflow,
        blocks: [getInfoBlock(context), mainBlock, { type: 'divider' }]
      }),
      slack.chat.postMessage({
        channel: channelId,
        thread_ts: slackTs,
        text: jobLabel,
        unfurl_links: false,
        blocks: [threadBlock]
      })
    ])
    if (!threadMessage.ts) {
      throw new Error('did not get slack thread ts')
    }
    core.saveState('slack-ts', mainMessage.ts)
    core.saveState('slack-thread-ts', threadMessage.ts)
  } else {
    const { mainBlock, threadBlock, jobLabel } = await getJobsStatusBlock(
      octokit,
      context
    )
    const mainMessage = await slack.chat.postMessage({
      channel: channelId,
      text: context.workflow,
      unfurl_links: false,
      blocks: [getInfoBlock(context), mainBlock, { type: 'divider' }]
    })
    if (!mainMessage.ts) {
      throw new Error('Did not get slack ts')
    }
    const threadMessage = await slack.chat.postMessage({
      channel: channelId,
      thread_ts: mainMessage.ts,
      text: jobLabel,
      unfurl_links: false,
      blocks: [threadBlock]
    })
    if (!threadMessage.ts) {
      throw new Error('did not get slack thread ts')
    }
    core.saveState('slack-ts', mainMessage.ts)
    core.saveState('slack-thread-ts', threadMessage.ts)
  }
}

run().catch(error => {
  core.error(
    `ksmithut/slack-stream-action: ${
      util.formatWithOptions({ depth: 3 }, error)
    }`
  )
})
