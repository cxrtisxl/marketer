import { User } from "../../entities/user";
import { Workflow, type Step } from "../../entities/workflow";

const u = new User();

// A simple looped workflow that requires user input
function userInputLoopWorkflow(): Workflow {
    const loop: Step = {
        handler: u,
        data: " Next:",
        next: () => loop
    }
    return new Workflow("test User loop", [loop])
}

export function run() {
    userInputLoopWorkflow().run()
}