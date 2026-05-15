import type { Result } from "../../common/types";
import type { MessageHandler } from "../common";
import type { Message, ResponseMessage } from "./message";

export type Context = Array<Message | ResponseMessage>

export type Step = {
    data: string
    readonly handler: MessageHandler
    next?: (response: ResponseMessage) => Step | undefined
    preHandler?: (message: Message, context: Context) => Promise<Result<[Message, Context]>>
    postHandler?: (response: ResponseMessage, context: Context) => Promise<Result<[ResponseMessage, Context]>>
}

export class Workflow {
    readonly _tag = "workflow" as const
    readonly label: string;
    #steps: Step[];

    // Note: mutates the original steps sequence
    constructor(label: string, steps: Step[]) {
        this.label = label;
        // If next() is not defined for the step - continuing in sequence
        for (const [i, step] of steps.entries()) {
            if (step.next === undefined && i < steps.length - 1) {
                step.next = () => { return steps[i + 1] }
            }
        }
        this.#steps = steps
    }

    async run(): Promise<Result<"completed">> {
        let context: Context = []

        const processStep = async (step: Step): Promise<Result<ResponseMessage>> => {
            // Constructing Message
            let msg: Message = {
                source: this,
                target: step.handler,
                context: context,
                data: step.data,
            }
            // preHandler modifies msg and context
            if (step.preHandler) {
                const res = await step.preHandler(msg, context)
                if (res.ok) {
                    [msg, context] = res.value
                } else {
                    return res
                }
            }
            // Calling handler
            let resp = await step.handler.handle(context, msg)
            if (!resp.ok) return resp;
            // Calling postHandler to modify response and context if needed
            if (step.postHandler) {
                const res = await step.postHandler(resp.value, context)
                if (res.ok) {
                    [resp.value, context] = res.value
                } else {
                    return res
                }
            }
            // Pushing response to context
            context.push(msg)
            context.push(resp.value)
            return resp
        }

        let step = this.#steps[0]
        if (!step) return { ok: true, value: "completed" };
        while (step) {
            const resp = await processStep(step)
            if (resp.ok) {
                step = step.next ? step.next(resp.value) : undefined
            } else {
                return resp
            }
        }
        return { ok: true, value: "completed" };
    }
}