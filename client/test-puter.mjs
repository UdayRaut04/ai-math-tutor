import { puter } from '@heyputer/puter.js';

async function test() {
    const res = await puter.ai.chat("What is 2+2?");
    console.log(res);
}

test();
