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
  const channelId = core.getInput('slack-channel-id') ||
    process.env.SLACK_CHANNEL_ID
  const githubToken = core.getInput('github-token', { required: true })

  const octokit = getOctokit(githubToken)
  const slack = new WebClient(slackToken)

  const slackTs = core.getState('slack-ts')
  const slackThreadTs = core.getState('slack-thread-ts')

  if (!slackTs) return
  if (!channelId) return

  const { mainBlock, threadBlock, jobLabel } = await getJobsStatusBlock(
    octokit,
    context
  )
  await Promise.all([
    slack.chat.update({
      channel: channelId,
      ts: slackTs,
      text: context.workflow,
      blocks: [getInfoBlock(context), mainBlock]
    }),
    slackThreadTs &&
    slack.chat.update({
      channel: channelId,
      ts: slackThreadTs,
      text: jobLabel,
      blocks: [threadBlock]
    })
  ])
}

run().catch(error => {
  core.error(util.format(error))
})
