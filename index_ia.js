const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = 80;
const HF_TOKEN = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

const { HfInference } = require('@huggingface/inference');

const inference = new HfInference(HF_TOKEN);

io.on('connection', (socket) => {
  let count = 0;
  socket.on('message', async data => {
    const text = data.text;
    const id = ++count;
    socket.emit('message', {
      id: id,
      text: "Rebut: " + text + ". Ara generaré imatge, espera uns minuts...",
    });
    const response = await fetch("http://ia-ltim.uib.es/api/txt2img", {
      method: 'post',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'prompt': data.text
      })
    });
    const json = await response.json();
    console.log(JSON.stringify(json));
    json.id = id;
    socket.emit('image', json);
  });
  socket.on('hfmessage', async data => {
    const text = data.text;
    const id = ++count;
    socket.emit('message', {
      id: id,
      text: "Rebut: " + text + ". Espera un poquet ç."
    });

    const image = await inference.textToImage({
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      inputs: text,
      parameters: {
        negative_prompt: "blurry",
      }
    });

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64 = buffer.toString('base64');

    const json = {
      id: id,
      images: [base64],
      type: image.type,
      info: 'pendent'
    };

    socket.emit('image', json);
    
  });
});

app.use(express.static('public'));

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
