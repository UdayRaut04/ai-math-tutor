import { puter } from '@heyputer/puter.js';

async function test() {
    try {
        const res = await puter.ai.chat("What is 2+2?");
        console.log("Keys:", Object.keys(res));
        console.log("String format:", res.toString());
        console.log("JSON:", JSON.stringify(res));
    } catch (e) {
        console.error(e);
    }
}

test();
