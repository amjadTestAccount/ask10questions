import express from "express";
import cors from "cors";
import fetch from "node-fetch";
const app = express();
app.use(cors());
app.use(express.json());
const REPLICATE_API_TOKEN = "r8_O8Ue4QriCfAImB3EXKZ3RZqauiv27br0YhGMf";
app.post("/generate", async (req, res) => {
 const answers = req.body.answers || [];
 const prompt = "Cartoon style illustration of " + answers.join(", ") + ", colorful, playful, digital art";
 try {
   const predictionRes = await fetch("https://api.replicate.com/v1/predictions", {
     method: "POST",
     headers: {
       "Authorization": `Token ${REPLICATE_API_TOKEN}`,
       "Content-Type": "application/json"
     },
     body: JSON.stringify({
       version: "db21e45e7e8c4c6c8e3a5c8f3c2b8e0e7f3a5c8f3c2b8e0e",
       input: { prompt, num_outputs: 5 }
     })
   });
   const prediction = await predictionRes.json();
   const predictionId = prediction.id;
   let status = prediction.status;
   let output = null;
   while (status !== "succeeded" && status !== "failed") {
     await new Promise(r => setTimeout(r, 1000));
     const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
       headers: { "Authorization": `Token ${REPLICATE_API_TOKEN}` }
     });
     const pollData = await pollRes.json();
     status = pollData.status;
     output = pollData.output;
   }
   if (status === "succeeded") {
     res.json({ images: output });
   } else {
     res.status(500).json({ error: "Prediction failed" });
   }
 } catch (err) {
   console.error(err);
   res.status(500).json({ error: "Something went wrong" });
 }
});
app.listen(3000, () => console.log("Server running on port 3000"));
