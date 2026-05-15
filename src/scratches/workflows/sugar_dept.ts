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
    const intros = {
        can: false,
        dy: false,
        upd: (resp: string) => {
            if (resp.toLocaleLowerCase().includes(" can")) {
                console.log("CAN INTRODUCED")
                intros.can = true
            }
            if (resp.toLocaleLowerCase().includes(" dy")) {
                console.log("DY INTRODUCED")
                intros.dy = true
            }
        }
    }

    const canStep: Step = {
        handler: new BaseAgent({
            systemPrompt: "You are a sugar department police officer. Your name is Can. You are a bad officer. You work with a partner - Mr Dy. You suspect the user in eating too much jellies which is a crime. Answer only with your replica. Maximum 2 sentences. Follow the roles in the conversation. Your answer should always be inside <officer_Can></officer_Can> tags"
        }),
        data: "",
        // If the agent not introduced, prompting it to introduce
        preHandler: async (msg: Message, context: Context) => {
            msg.data += intros.can ? "" : "<system>Introduce yourself mentioning your name. Then proceed with your answer.</system>"
            return { ok: true, value: [msg, context] }
        },
        // Getting the agent's response to check that it introduced themself
        postHandler: async (resp: ResponseMessage, context: Context) => {
            intros.upd(resp.data)
            if (!resp.data.startsWith("<officer_Can>")) {
                resp.data = `<officer_Can>${resp.data}</officer_Can>`
            }
            return { ok: true, value: [resp, context] }
        },
        next: () => userStep
    }

    const dyStep: Step = {
        handler: new BaseAgent({
            systemPrompt: "You are a sugar department police officer. Your name is Dy. You are a nice officer. You work with a partner - Mr Can. You suspect the user in eating too much jellies which is a crime. Answer only with your replica. Maximum 2 sentences. Consider following the roles in the context. Your answer should always be inside <officer_Dy></officer_Dy> tags"
        }),
        data: "",
        preHandler: async (msg: Message, context: Context) => {
            msg.data += intros.dy ? "" : "<system>Introduce yourself mentioning your name. Then proceed with your answer.</system>"
            return { ok: true, value: [msg, context] }
        },
        postHandler: async (resp: ResponseMessage, context: Context) => {
            intros.upd(resp.data)
            if (!resp.data.startsWith("<officer_Dy>")) {
                resp.data = `<officer_Dy>${resp.data}</officer_Dy>`
            }
            return { ok: true, value: [resp, context] }
        },
        next: () => userStep
    }

    userStep = {
        handler: u,
        data: "",
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
            console.log("DBG", data)
            if (data.toLowerCase().includes("can")) {
                ctx.answers = "officer_Can"
                return canStep
            }
            else if (data.toLocaleLowerCase().includes("dy")) {
                ctx.answers = "officer_Dy"
                return dyStep
            }
            if (Math.random() > 0.5) {
                ctx.answers = "officer_Can"
                return canStep
            }
            ctx.answers = "officer_Dy"
            return dyStep
        },
    }

    return new Workflow("Agent conversation", [userStep, canStep, dyStep])
}

export function run() {
    userAgentLoopWorkflow().run()
}