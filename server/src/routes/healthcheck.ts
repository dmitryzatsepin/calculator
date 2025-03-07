import express from "express";

const app = express();

app.get("/healthcheck", (req, res) => {
    res.status(200).json({ status: "OK" });
});

export default app;
