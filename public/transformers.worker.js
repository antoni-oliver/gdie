import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0";
env.allowLocalModels = false;

let translator;

self.addEventListener('message', async (event) => {
  const message = event.data;
  switch (message.action) {
    case 'download':
      let task = message.task;
      let model = message.model;

      translator = await pipeline(task, model, {
        progress_callback: data => {
          self.postMessage({
            status: 'downloading',
            result: data
          });
        }
      });

      self.postMessage({
        status: 'ready',
        task: task,
        model: model
      });
      break;
    case 'translate':
      const output = await translator(message.input, {
        ...message.generation,
        callback_function: beams => {
          const decodedText = translator.tokenizer.decode(beams[0].output_token_ids, {
            skip_special_tokens: true
          });
          self.postMessage({
            status: 'update',
            result: decodedText
          });
        }
      });

      self.postMessage({
        status: 'result',
        result: output[0].translation_text
      });
      break;
  }
});
