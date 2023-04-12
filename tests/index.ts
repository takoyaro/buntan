import Buntan from '../src/index.js'
const buntan = await new Buntan().init();

const repos = [
    "everythingishacked/Semaphore. A full-body keyboard using gestures to type through computer vision",
    "shadcn/taxonomy. An open source application built using the new router, server components and everything new in Next.js 13.",
    "reworkd/AgentGPT. 🤖 Assemble, configure, and deploy autonomous AI Agents in your browser.",
    "sveltetools/svelte-asyncable. Asyncable store for Svelte 3 which is store a value as promise.",
    "prisma/prisma. Next-generation ORM for Node.js & TypeScript | PostgreSQL, MySQL, MariaDB, SQL Server, SQLite, MongoDB and CockroachDB",
    "pola-rs/polars. Fast multi-threaded, hybrid-out-of-core DataFrame library in Rust | Python | Node.js",
    "Sanster/lama-cleaner. Image inpainting tool powered by SOTA AI Model. Remove any unwanted object, defect, people from your pictures or erase and replace(powered by stable diffusion) any thing on your pictures.",
    "makeplane/plane. 🔥 🔥 🔥 Open Source JIRA, Linear and Height Alternative. Plane helps you track your issues, epics, and product roadmaps in the simplest way possible.",
    "sw-yx/ai-notes. notes for software engineers getting up to speed on new AI developments. Serves as datastore for https://latent.space writing, and product brainstorming, but has cleaned up canonical references under the /Resources folder.",
    "apache/dolphinscheduler. Apache DolphinScheduler is the modern data workflow orchestration platform with powerful user interface, dedicated to solving complex task dependencies in the data pipeline and providing various types of jobs available `out of the box`",
    "microsoft/DeepSpeed. DeepSpeed is a deep learning optimization library that makes distributed training and inference easy, efficient, and effective.",
];

await Promise.all(repos.map((x) => {
    return buntan.insert('repos', x);
}));

console.log(await buntan.query_similarity('repos', 'AI in the browser', 5,true));