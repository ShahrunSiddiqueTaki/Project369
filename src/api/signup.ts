import { Hono } from "hono";

const app = new Hono();

app.get('/', (c) => {
    return c.redirect('./signup.html');
})

export default app;