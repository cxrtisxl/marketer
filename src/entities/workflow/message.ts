import type { User } from "../user";
import type { BaseAgent } from "../agent";
import type { Tool } from "../tool";
import type { Workflow } from "../workflow";
import type { MessageHandler } from "../common";
import type { Context } from "./workflow";

export type MessageSource = User | BaseAgent | Tool | Workflow; // Message producer

export type Message = {
    source: MessageSource,
    target: MessageHandler,
    context: Context,
    data: string,
    prefill?: string
}

export type ResponseMessage = {
    source: MessageSource,
    // no target and context - ResponseMessage is always returns to the caller
    data: string,
    error?: Error,
}