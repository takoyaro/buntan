@takoyaro/buntan / [Exports](modules.md)

# Buntan - An in-memory semantic search database

Buntan is an in-memory database designed to perform semantic searches.

## Features
In-memory database for fast access to data
Typed API with full Typescript support
Cross-platform support for Node.js and browser environments
Lightweight and easy to use

## Installation
To install Buntan, you can use npm:
```bash
pnpm add @takoyaro/buntan
```

## Usage
**See [docs](/docs/modules.md)**

To use Buntan in your project, you can import it like this:

### Initialization
```typescript
import Buntan from '@takoyaro/buntan';

// create a new database
const client = new Buntan();
// await for the model to be initialized
await client.init();
```

### Insert
```ts
// Add data to a collection with an optional metadata object.
await client.collection("my_collection").insert_one("Transformers.js - Run 🤗 Transformers in your browser! Supports a variety of tasks including: masked language modelling, text classification, token classification, zero-shot classification, text-to-text generation, translation, summarization, question answering, text generation, automatic speech recognition, image classification, zero-shot image classification, image-to-text, image segmentation, and object detection.",{
    tags:['transformers','javascript','ai'],
    custom_property:"🤗"
});

// Add many data at once
let data = [
    {data:"tokio - A runtime for writing reliable, asynchronous, and slim applications with the Rust programming language.",metadata:{tags:["rust","async"]}},
    {data:"numpy - The fundamental package for scientific computing with Python.",metadata:{tags:["python","numpy"]}},
]
await client.collection("test").insert_many(data)
```

### Search
```ts
// query the database using natural language
const results = await client.collection("test").query_similarity('rust async',{top: 10});

console.log(results);
```
```JSON
//results
[
  {
    "_id": "e608d1f4-9dd2-46f3-9d8f-431a5cfbdc15",
    "score": 0.5175281498388199,
    "data": "tokio - A runtime for writing reliable, asynchronous, and slim applications with the Rust [...]", //trimmed for example
    "metadata": {
      "tags": [
        "rust",
        "async"
      ],
      "another_custom_property": "Blazingly Fast!!!"
    }
  },
  {
    "_id": "54823e9f-369c-40f0-99ac-763dd5b6612d",
    "score": 0.22872740107338124,
    "data": "Transformers.js - Run 🤗 Transformers in your browser! Supports a variety of tasks including: masked [...]", //trimmed for example
    "metadata": {
      "tags": [
        "transformers",
        "javascript",
        "ai"
      ],
      "custom_property": "🤗"
    }
  }
]
```

# Documentation
**See [/docs](/docs/modules.md)**

# Contributing
Contributions to Buntan are welcome!
