import { puter } from '@heyputer/puter.js';
import fs from 'fs';
import path from 'path';

async function uploadDir(localDir, remoteDir) {
    const items = fs.readdirSync(localDir);
    for (const item of items) {
        const localPath = path.join(localDir, item);
        const remotePath = `${remoteDir}/${item}`;
        if (fs.statSync(localPath).isDirectory()) {
            await puter.fs.mkdir(remotePath).catch(e => {
                if (!e.message?.includes('already exists')) throw e;
            });
            await uploadDir(localPath, remotePath);
        } else {
            console.log("Uploading " + remotePath);
            const content = fs.readFileSync(localPath);
            await puter.fs.write(remotePath, content, { overwrite: true });
        }
    }
}

(async () => {
    try {
        const siteDir = 'my-math-tutor-out';
        console.log(`Creating directory ${siteDir}`);
        await puter.fs.mkdir(siteDir).catch(e => {
            if (!e.message?.includes('already exists')) throw e;
        });
        
        console.log(`Uploading files from ./out to ${siteDir}...`);
        await uploadDir('./out', siteDir);
        
        const subdomain = 'math-tutor-' + Math.random().toString(36).substring(2, 8);
        console.log(`Creating hosting on subdomain: ${subdomain}...`);
        
        const site = await puter.hosting.create(subdomain, siteDir);
        
        console.log(`\n=========================================`);
        console.log(`🚀 DEPLOYED SUCCESSFULLY!`);
        console.log(`🌐 URL: https://${site.subdomain}.puter.site`);
        console.log(`=========================================\n`);
    } catch(err) {
        console.error("Deployment failed:", err);
    }
})();
