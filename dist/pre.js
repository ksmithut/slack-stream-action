import{a as r,b as u,c as l,d as p}from"./chunk-HH4DAJU3.js";var t=r(u(),1),o=r(l(),1),s=r(p(),1);import e from"node:process";import f from"node:util";async function k(){let n=t.getInput("slack-bot-token")||e.env.SLACK_BOT_TOKEN,m=t.getInput("slack-channel-id")||e.env.SLACK_CHANNEL_ID,g=t.getInput("slack-ts"),i=t.getInput("github-token",{required:!0}),b=t.getInput("status",{required:!0}),c=(0,o.getOctokit)(i),I=new s.WebClient(n);t.info(JSON.stringify({context:o.context,env:e.env},null,2)),t.setOutput("slack-ts","foobar!"),t.notice(`slack-ts: ${e.env.SLACK_TS}`);let a=await c.paginate(c.rest.actions.listJobsForWorkflowRunAttempt,{...o.context.repo,run_id:o.context.runId,attempt_number:Number.parseInt(e.env.GITHUB_RUN_ATTEMPT||"1",10)});t.info(JSON.stringify(workflowResponse.data,null,2)),t.info(JSON.stringify(a,null,2))}k().catch(n=>{t.error(f.format(n))});export{k as run};
