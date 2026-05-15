import type { Result } from "../../common/types";
import type { MessageHandler } from "../common"
import type { Message, ResponseMessage } from "../workflow/message"
import type { Context } from "../workflow/workflow";

export class User implements MessageHandler {
    async handle(context: Context, message: Message): Promise<Result<ResponseMessage>> {
        const resp = prompt((context.length ? context[context.length - 1]?.data + "\n-" : "-") + message.data);
        return {
            ok: true,
            value: {
                source: this,
                data: resp || "",
            }
        }
    }
}