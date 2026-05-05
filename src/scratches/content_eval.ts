import { AnthropicSession } from "../anthropic";

let res = AnthropicSession.create({
    system: "You are a professional marketer. Your job is creating text creatives for Google Ads.",
    prefill: [{role: "user", content: "Make an a general ad for a private VIP dentist. Text only. 2 sentences."}]
})
if (!res.ok) {
    console.error(res.error)
    process.exit(1)
}
const session1 = res.value

let msgRes = await session1.process()
if(!msgRes.ok) {
    console.error(msgRes.error)
    process.exit(1)
}
const session1Response = msgRes.value.content[0]?.type === "text" ? msgRes.value.content[0].text : "No Data"
console.log(session1Response)


res = AnthropicSession.create({
    system: "You are a professional marketer lead. Your job is to review marketing creatives for Google Ads.",
    prefill: [{role: "user", content: "The marketer should create a general ad for a private VIP dentist. Validate the result. Answer with `ok` if all is good. Otherwise, add details on what should be changed. <content>"}]
})
if (!res.ok) {
    console.error(res.error);
    process.exit(1)
}
const session2 = res.value
session2.addMessage({role: "user", content: `${session1Response}</content>`})
msgRes = await session2.process()
if(!msgRes.ok) {
    console.error(msgRes.error)
    process.exit(1)
}
const session2Response = msgRes.value.content[0]?.type === "text" ? msgRes.value.content[0].text : "No Data"
console.log(session2Response)