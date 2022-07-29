import * as core from '@actions/core'

/**
 * @param {ReturnType<import('@actions/github').getOctokit>} octokit
 * @param {typeof import('@actions/github').context} context
 */
export async function getJobsStatusBlock (octokit, context) {
  octokit.rest.actions.getJobForWorkflowRun
  const jobs = await octokit.paginate(
    octokit.rest.actions.listJobsForWorkflowRunAttempt,
    {
      ...context.repo,
      run_id: context.runId,
      attempt_number: Number.parseInt(process.env.GITHUB_RUN_ATTEMPT || '1', 10)
    }
  )
  const fullJobsText = jobs.map(job => getJobText(job)).join(' --> ')
  const mainBlock = {
    block_id: 'jobs',
    type: 'section',
    text: { type: 'mrkdwn', text: fullJobsText }
  }
  const job = jobs.find(job => job.node_id === context.job)
  if (!job) {
    core.info(JSON.stringify({ jobs, context, env: process.env }, null, 2))
    throw new Error('could not find job')
  }
  const threadBlock = {
    block_id: job.node_id,
    type: 'section',
    text: { type: 'mrkdwn', text: getJobText(job) }
  }
  const jobLabel = getJobLabel(job)
  return { mainBlock, threadBlock, jobLabel }
}

/**
 * @typedef {object} Job
 * @property {string} status
 * @property {string?} conclusion
 * @property {string?} completed_at
 * @property {string} started_at
 * @property {string?} html_url
 * @property {string} name
 */

/**
 * @param {Job} job
 */
function getJobText (job) {
  const emoji = getJobEmoji(job)
  const completionTime = getCompletionTime(job)
  const suffix = completionTime ? ` ${completionTime}` : ''
  const text = `:${emoji}: ${job.name}${suffix}`
  return job.html_url ? `<${job.html_url}|${text}>` : text
}

/**
 * @param {Job} job
 */
function getJobLabel (job) {
  return `${job.name}: ${job.status} ${job.conclusion ?? ''}`
}

/**
 * @param {Job} job
 */
function getJobEmoji (job) {
  if (job.status === 'queued') return 'slack-stream-pending'
  if (job.status === 'in_progress') return 'slack-stream-running'
  if (job.status === 'completed') {
    if (job.conclusion === 'success') return 'slack-stream-success'
    if (job.conclusion === 'failure') return 'slack-stream-failure'
    if (job.conclusion === 'cancelled') return 'slack-stream-cancelled'
  }
  throw new Error(
    `unknown status: ${job.status}, conclusion: ${job.conclusion}`
  )
}

/**
 * @param {Job} job
 */
function getCompletionTime (job) {
  if (!job.completed_at) return null
  const completedAt = new Date(job.completed_at)
  const startedAt = new Date(job.started_at)
  const durationMs = completedAt.getTime() - startedAt.getTime()
  const durationSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/**
 * @param {typeof import('@actions/github').context} context
 */
export function getInfoBlock (context) {
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
  return {
    block_id: 'info',
    type: 'context',
    elements: info.map(item => ({
      type: 'mrkdwn',
      text: `*${item.label}*     \n<${item.url}|${item.value}>     `
    }))
  }
}
