import './lib/patch-require.js'
// dprint-ignore
import * as core from '@actions/core'

core.setOutput('slack-ts', core.getState('slack-ts'))
