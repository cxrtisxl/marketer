import { BaseAgent } from "../../entities/agent";
import { User } from "../../entities/user";
import { Workflow, type Step } from "../../entities/workflow";
import type { Message, ResponseMessage } from "../../entities/workflow/message";
import type { Context } from "../../entities/workflow/workflow";

const u = new User();

function userAgentLoopWorkflow(): Workflow {
    let userStep: Step | undefined
    type ctxAnswersOptions = "officer_Can" | "officer_Dy" | undefined
    const ctx: { answers: ctxAnswersOptions, getAnswers: () => ctxAnswersOptions } = {
        answers: undefined,
        getAnswers: () => ctx.answers
    }

    const officerStep: Step = {
        handler: new BaseAgent({
            systemPrompt: "You are a narrator. The actors are <suspect>, <officer_Can> and his partner <officer_Dy>. Officers are from Sugar Department and are investigating jelly incident. Answer with one officer replica at a time. Place replicas in the corresponding tags - <officer_Can> or <officer_Dy>. Never answer for <suspect>. Officer Can is a bad cop and officer Dy is a good guy. Follow <turn_info> tag that when exists contain the instruction about which officer should answer next."
        }),
        data: "",
        preHandler: async (msg: Message, context: Context) => {
            msg.data = `<turn_info>It's time for ${ctx.getAnswers()}</turn_info>`
            return { ok: true, value: [msg, context] }
        },
        postHandler: async (resp: ResponseMessage, context: Context) => {
            if (!resp.data.startsWith(`<${ctx.getAnswers()}>`)) {
                resp.data = `<${ctx.getAnswers()}>${resp.data}</${ctx.getAnswers()}>`
            }
            return { ok: true, value: [resp, context] }
        },
        next: () => userStep
    }

    userStep = {
        handler: u,
        data: "",
        preHandler: async (msg: Message, context: Context) => {
            console.log("======")
            console.log(context.map(i => i.data).join("\n"))
            console.log("======")
            return { ok: true, value: [msg, context] }
        },
        postHandler: async (resp: ResponseMessage, context: Context) => {
            const addressed = ctx.getAnswers()
            if (addressed) {
                resp.data = `<suspect><addressed_to:${addressed}>${resp.data}</addressed_to:${addressed}></suspect>`
            } else {
                resp.data = `<suspect>${resp.data}</suspect>`
            }
            return { ok: true, value: [resp, context] }
        },
        next: (msg: ResponseMessage) => {
            const addressed = ctx.getAnswers()
            const data = msg.data.replaceAll(`<addressed_to:${addressed}>`, "").replaceAll(`</addressed_to:${addressed}>`, "")
            if (data.toLowerCase().includes("can")) {
                ctx.answers = "officer_Can"
            } else if (data.toLocaleLowerCase().includes("dy")) {
                ctx.answers = "officer_Dy"
            }
            if (Math.random() > 0.5) {
                ctx.answers = "officer_Can"
            } else {
                ctx.answers = "officer_Dy"
            }
            return officerStep
        },
    }

    return new Workflow("Agent conversation", [userStep, officerStep])
}

export async function run() {
    userAgentLoopWorkflow().run()
}
