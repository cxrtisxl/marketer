import Anthropic from "@anthropic-ai/sdk";
import type {
    Message,
    ContentBlock,
    TextBlock,
    Model,
    MessageParam,
    TextBlockParam
} from "@anthropic-ai/sdk/resources/messages/messages";
import type { Result } from "../common/types.ts";
import {validateMessages} from "./helpers.ts";


export class AnthropicSession {
    #client = new Anthropic();
    #messages: MessageParam[] = [];
    get messages(): readonly  MessageParam[] { return this.#messages }
    protected model: Model = "claude-sonnet-4-6"
    protected system?: string | Array<TextBlockParam>

    private constructor(opts: {
        model?: Model,
        system?: string | Array<TextBlockParam>,
        prefill?: MessageParam[],
    }) {
        if (opts.model) this.model = opts.model;
        if (opts.system) this.system = opts.system;
        if (opts.prefill) this.#messages = [...opts.prefill]
    }

    static create(opts: {
        model?: Model,
        system?: string | Array<TextBlockParam>,
        prefill?: MessageParam[],
    }): Result<AnthropicSession> {
        if (!process.env.ANTHROPIC_API_KEY) {
            return { ok: false, error: new Error("missing API key") };
        }
        if (opts.prefill) {
            if (!validateMessages(opts.prefill)) {
                return { ok: false, error: new Error("invalid prefill") }
            }
        }
        return { ok: true, value: new AnthropicSession(opts) };
    }

    async send(message: MessageParam, maxTokens: number = 1024): Promise<Result<Message>> {
        this.addMessage(message);
        return await this.process(maxTokens)
    }

    addMessage(message: MessageParam) {
        const lastMsg = this.#messages[this.#messages.length - 1]
        if (lastMsg && lastMsg.role === message.role) {
            if (typeof lastMsg.content === "string" && typeof message.content === "string") {
                lastMsg.content += message.content
            } else {
                const a = typeof lastMsg.content === "string" ? [{ type: "text" as const, text: lastMsg.content }] : lastMsg.content
                const b = typeof message.content === "string" ? [{ type: "text" as const, text: message.content }] : message.content
                lastMsg.content = [...a, ...b]
            }
        } else {
            this.#messages.push(message)
        }
    }

    async process(maxTokens: number = 1024): Promise<Result<Message>> {
        const response = await this.#client.messages.create({
            model: this.model,
            max_tokens: maxTokens,
            messages: this.#messages,
            system: this.system
        });
        return { ok: true, value: response }
    }
}