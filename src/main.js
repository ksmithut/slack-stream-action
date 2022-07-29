import * as core from '@actions/core'

core.info(`slack-ts: ${core.getInput('slack-ts')}`)
core.setOutput('slack-ts', 'main')
