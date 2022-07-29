import{a as k,b as f}from"./chunk-PFWPZI57.js";import{c as l,e as h}from"./chunk-UJFNRH2W.js";var o=l(h(),1),t=l(k(),1),c=l(f(),1);import u from"node:process";import g from"node:util";async function d(){let e=o.getInput("slack-bot-token")||u.env.SLACK_BOT_TOKEN,i=o.getInput("slack-ts"),s=o.getInput("slack-channel-id"),_=o.getInput("status",{required:!0}),p=o.getInput("github-token",{required:!0}),a=(0,t.getOctokit)(p),m=new c.WebClient(e);if(!e)throw new Error("Missing input slack-bot-token or environment variable SLACK_BOT_TOKEN");if(!i)if(s){let y=await a.paginate(a.rest.actions.listJobsForWorkflowRunAttempt,{...t.context.repo,run_id:t.context.runId,attempt_number:Number.parseInt(u.env.GITHUB_RUN_ATTEMPT||"1",10)}),r=[{label:"Author",url:`https://github.com/${t.context.actor}`,value:t.context.actor},{label:"Workflow Run",url:`https://github.com/${t.context.repo.owner}/${t.context.repo.repo}/runs/${t.context.runId}`,value:t.context.action}];t.context.payload.repository?.html_url&&r.push({label:"Repo",url:t.context.payload.repository.html_url,value:t.context.payload.repository.name}),t.context.payload.pull_request?.html_url&&r.push({label:"PR",url:t.context.payload.pull_request.html_url,value:`#${t.context.payload.pull_request.number}`}),console.log(JSON.stringify(t.context,null,2));let b=await m.chat.postMessage({channel:s,blocks:[{block_id:"info",type:"context",elements:r.map(n=>({type:"mrkdwn",text:`*${n.label}*
<${n.url}|${n.label}>`}))}]});console.log(JSON.stringify(b,null,2))}else throw new Error("missing input slack-ts or channel-id")}d().catch(e=>{o.error(g.format(e))});export{d as run};
