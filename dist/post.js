import{a as d,b as T,c as l,d as i}from"./chunk-XJMICREQ.js";import{c as r,e as b}from"./chunk-UJFNRH2W.js";var t=r(b(),1),o=r(d(),1),m=r(T(),1);import k from"node:process";import I from"node:util";async function w(){let e=t.getInput("slack-bot-token")||k.env.SLACK_BOT_TOKEN,c=t.getInput("slack-channel-id")||k.env.SLACK_CHANNEL_ID,u=t.getInput("github-token",{required:!0}),p=(0,o.getOctokit)(u),n=new m.WebClient(e),a=t.getState("slack-ts"),s=t.getState("slack-thread-ts");if(!a||!c)return;let{mainBlock:f,threadBlock:h,jobLabel:g}=await l(p,o.context);await Promise.all([n.chat.update({channel:c,ts:a,text:o.context.workflow,blocks:[i(o.context),f]}),s&&n.chat.update({channel:c,ts:s,text:g,blocks:[h]})])}w().catch(e=>{t.error(I.format(e))});export{w as run};
