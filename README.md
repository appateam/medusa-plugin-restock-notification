# Restock notification plugin

Add restock notifications to your Medusa store

> Under development, use at your own risk!

## Features

- Add restock notification based on logged-in customer ID
- Trigger restock notification event when stock changes
  - Listens to both product variant updates and inventory level updates
  - Handle event in your backend code by sending email/SMS etc.

---

## Prerequisites

- [Medusa backend](https://docs.medusajs.com/development/backend/install)

---

## How to Install

1\. Run the following command in the directory of the Medusa backend:

```bash
npm install @appateam/medusa-plugin-restock-notification
```

2 \. In `medusa-config.js` add the following at the end of the `plugins` array:

```js
const plugins = [
  // ...
  {
    resolve: `@appateam/medusa-plugin-restock-notification`,
    options: {
      enableUI: true
    }
  },
]
```
