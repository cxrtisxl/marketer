import type {MessageParam} from "@anthropic-ai/sdk/resources/messages/messages";

export function validateMessages(messages: MessageParam[]): boolean {
    for(let i in messages) {
        console.log(i)
    }
    return true
}