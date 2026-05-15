import type { MessageParam } from "@anthropic-ai/sdk/resources/messages/messages";
import type { Context } from "../workflow/workflow";
import { BaseAgent } from "../agent";
import type { MessageSource, Message } from "../workflow/message";

export function sourceToRole(src: MessageSource): 'user' | 'assistant' {
    if (src instanceof BaseAgent) return 'assistant'
    return 'user'
}

export function contextToMessageParam(context: Context): MessageParam[] {
    const reduced = context.reduce<MessageParam[]>((res, item) => {
        const last = res[res.length - 1];
        if (last?.role === sourceToRole(item.source)) {
            last.content += `${item.data}`
        } else {
            res.push({ role: sourceToRole(item.source), content: item.data })
        }
        return res
    }, []);

    const last = context[context.length - 1]
    if (last && "prefill" in last && last.prefill && "target" in last && last.target instanceof BaseAgent) {
        reduced.push({ role: "assistant", content: last.prefill })
    }
    return reduced
}