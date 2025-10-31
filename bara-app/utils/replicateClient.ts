import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function generateImages(prompt: string, numOutputs = 3) {
  const model = "black-forest-labs/flux-dev"; 
  const output = await replicate.run(model, {
    input: {
      prompt,
      num_outputs: numOutputs,
      aspect_ratio: "1:1",
    },
  });
  return output;
}
