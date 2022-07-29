/**
 * @param {ReturnType<import('@actions/github').getOctokit>} octokit
 * @param {typeof import('@actions/github').context} context
 */
export async function getJobsStatusText (octokit, context) {
  const jobs = await octokit.paginate(
    octokit.rest.actions.listJobsForWorkflowRunAttempt,
    {
      ...context.repo,
      run_id: context.runId,
      attempt_number: Number.parseInt(process.env.GITHUB_RUN_ATTEMPT || '1', 10)
    }
  )
  return jobs
    .map(job => {
      job.started_at
      const emoji = getJobEmoji(job)
      const completionTime = getCompletionTime(job)
      const suffix = completionTime ? ` ${completionTime}` : ''
      return `<${job.html_url}|:${emoji}: ${job.name}${suffix}>`
    })
    .join(' --> ')
}

/**
 * @param {{ status: string, conclusion: string? }} job
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
 * @param {{ completed_at: string?, started_at: string }} job
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
