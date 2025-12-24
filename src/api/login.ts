import { Hono } from "hono";

const app = new Hono()

app.get('/', (c) => {
    return c.text('Server is running');
})

export default app;