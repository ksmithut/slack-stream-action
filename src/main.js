import './lib/patch-require.js'
// dprint-ignore
import * as core from '@actions/core'

core.info(`slack-ts: ${core.getInput('slack-ts')}`)
core.info(`state: ${core.getState('testing')}`)
core.setOutput('slack-ts', 'main')
