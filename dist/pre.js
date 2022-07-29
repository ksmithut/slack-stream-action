import{a as d,b as w}from"./chunk-PFWPZI57.js";import{c as s,e as _}from"./chunk-UJFNRH2W.js";var e=s(_(),1),t=s(d(),1),b=s(w(),1);import n from"node:process";import g from"node:util";async function v(){let r=e.getInput("slack-bot-token")||n.env.SLACK_BOT_TOKEN,a=e.getInput("slack-ts"),l=e.getInput("slack-channel-id")||n.env.SLACK_CHANNEL_ID,$=e.getInput("status",{required:!0}),f=e.getInput("github-token",{required:!0}),c=(0,t.getOctokit)(f),h=new b.WebClient(r);if(!r)throw new Error("Missing input slack-bot-token or environment variable SLACK_BOT_TOKEN");if(a)e.saveState("slack-ts",a);else if(l){e.info(JSON.stringify({context:t.context,env:n.env},null,2));let u=await c.paginate(c.rest.actions.listJobsForWorkflowRunAttempt,{...t.context.repo,run_id:t.context.runId,attempt_number:Number.parseInt(n.env.GITHUB_RUN_ATTEMPT||"1",10)}),i=`${t.context.repo.owner}/${t.context.repo.repo}`,p=`https://github.com/${i}`,k=[{label:"Repo",url:p,value:i},{label:"Workflow",url:`${p}/actions/runs/${t.context.runId}`,value:t.context.workflow},{label:"Author",url:`https://github.com/${t.context.actor}`,value:t.context.actor}];t.context.payload.pull_request?.html_url&&k.push({label:"PR",url:t.context.payload.pull_request.html_url,value:`#${t.context.payload.pull_request.number}`});let m=await h.chat.postMessage({channel:l,text:`${t.context.workflow}`,unfurl_links:!1,attachments:[{color:"#d4ad3c",blocks:[{block_id:"info",type:"context",elements:k.map(o=>({type:"mrkdwn",text:`*${o.label}*     
<${o.url}|${o.value}>     `}))},{block_id:"jobs",type:"section",text:{type:"mrkdwn",text:u.map(o=>`<${o.check_run_url}|:tada:>`).join(" --> ")}}]}]});if(!m.ts)throw new Error("Did not get slack ts");e.saveState("slack-ts",m.ts),console.log(JSON.stringify(u,null,2))}else throw new Error("missing input slack-ts or channel-id");e.saveState("start",Date.now())}v().catch(r=>{e.error(`ksmithut/slack-stream-action: ${g.format(r)}`)});export{v as run};
