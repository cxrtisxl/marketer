import type {MessageParam} from "@anthropic-ai/sdk/resources/messages/messages";

export function validateMessages(messages: MessageParam[]): boolean {
    for (let i = 1; i < messages.length; i++) {
        if (messages[i]!.role === messages[i - 1]!.role) return false
    }
    return true
}