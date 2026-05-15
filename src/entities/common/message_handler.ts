import type { Result } from "../../common/types";
import type { Message, ResponseMessage } from "../workflow/message";
import type { Context } from "../workflow/workflow";

export interface MessageHandler {
    handle(context: Context, message: Message): Promise<Result<ResponseMessage>>
}