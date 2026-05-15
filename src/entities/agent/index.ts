import type { Result } from "../../common/types";
import { AnthropicSession } from "../../services/anthropic";
import type { MessageHandler } from "../common";
import { contextToMessageParam } from "../common/context_formatter";
import type { Message, ResponseMessage } from "../workflow/message"
import type { Context } from "../workflow/workflow";
import type { Model } from "@anthropic-ai/sdk/resources/messages/messages";

export class BaseAgent implements MessageHandler {
    #session?: AnthropicSession;

    constructor(opt?: { model?: Model, systemPrompt?: string }) {
        // Hi. I'm working with Anthropic SDK right now to set up some workflow. Do you have a system prompt that guides you to act as narrator?
        console.log(opt?.systemPrompt)
        const res = AnthropicSession.create({
            model: opt?.model,
            system: opt?.systemPrompt,
        })
        if (res.ok) {
            this.#session = res.value
        } else {
            console.error(res.error)
        }
    }

    async handle(context: Context, message: Message): Promise<Result<ResponseMessage>> {
        if (!this.#session) {
            return { ok: false, error: Error("agent session is not initialized") }
        }
        const res = await this.#session.process(1024, contextToMessageParam([...context, message]), true)
        if (!res.ok) return res;

        let data: string
        if (res.value.content?.[0]?.type === "text") {
            data = res.value.content[0].text
        } else {
            return { ok: false, error: Error("empty response") }
        }

        return {
            ok: true,
            value: { source: this, data }
        }
    }
}