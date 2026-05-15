import Anthropic from "@anthropic-ai/sdk";
import type {
    Message,
    Model,
    MessageParam,
    TextBlockParam
} from "@anthropic-ai/sdk/resources/messages/messages";
import type { Result } from "../../common/types.ts";
import { validateMessages } from "./helpers.ts";


export class AnthropicSession {
    #client = new Anthropic();
    #prefill: MessageParam[] = [];
    #messages: MessageParam[] = [];
    get messages(): readonly MessageParam[] { return this.#messages }
    protected model: Model = "claude-sonnet-4-6"
    protected system?: string | Array<TextBlockParam>

    private constructor(opts: {
        model?: Model,
        system?: string | Array<TextBlockParam>,
        prefill?: MessageParam[],
    }) {
        if (opts.model) this.model = opts.model;
        if (opts.system) this.system = opts.system;
        if (opts.prefill) {
            const pf = [...opts.prefill];
            this.#messages = pf
            this.#prefill = pf
        }
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

    overrideMessages(messages: MessageParam[]): boolean {
        for (let i = 1; i < messages.length; i++) {
            if (messages[i - 1]?.role === messages[i]?.role) return false
        }
        this.#messages = messages
        return true
    }

    async process(maxTokens: number): Promise<Result<Message>>;
    async process(maxTokens: number, messages: MessageParam[], ignorePrefill: boolean): Promise<Result<Message>>;
    async process(maxTokens: number, messages?: MessageParam[], ignorePrefill?: boolean): Promise<Result<Message>> {
        messages = messages ? (ignorePrefill ? messages : this.#prefill.concat(messages)) : this.#messages
        const response = await this.#client.messages.create({
            system: this.system,
            model: this.model,
            max_tokens: maxTokens,
            messages
        });
        return { ok: true, value: response }
    }
}