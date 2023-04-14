# Buntan - An in-memory semantic search database

Buntan is an in-memory database designed to perform semantic searches.

## Features
In-memory database for fast access to data
Typed API with full Typescript support
Cross-platform support for Node.js and browser environments
Lightweight and easy to use

## Installation
To install MyLibrary, you can use npm:
```bash
pnpm add buntan
```

## Usage
To use Buntan in your project, you can import it like this:

### Initialization
```typescript
import Buntan from '@takoyaro/buntan';

// create a new database
const database = new Buntan();
// await for the model to be initialized
await database.init();
```

### Insert
```ts
// add data to a collection with an optional metadata object.
await database.insert('repos_collection',"Transformers.js - Run 🤗 Transformers in your browser! Supports a variety of tasks including: masked language modelling, text classification, token classification, zero-shot classification, text-to-text generation, translation, summarization, question answering, text generation, automatic speech recognition, image classification, zero-shot image classification, image-to-text, image segmentation, and object detection.",{
    tags:['transformers','javascript','ai'],
    custom_property:"🤗"
});

await database.insert('repos_collection',"tokio - A runtime for writing reliable, asynchronous, and slim applications with the Rust programming language. It is: Fast: Tokio's zero-cost abstractions give you bare-metal performance.Reliable: Tokio leverages Rust's ownership, type system, and concurrency model to reduce bugs and ensure thread safety. Scalable: Tokio has a minimal footprint, and handles backpressure and cancellation naturally.",{
    tags:['rust','async'],
    another_custom_property:"Blazingly Fast!!!"
});
```

### Search
```ts
// query the database using natural language
const results = await database.query_similarity('repos_collection','rust async');

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
WIP

# Contributing
Contributions to Buntan are welcome!

