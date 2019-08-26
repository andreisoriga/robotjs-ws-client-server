/* eslint-disable strict */
const WebSocketAsPromised = require('websocket-as-promised')
const W3CWebSocket = require('websocket').w3cwebsocket
const Jimp = require('jimp')

const wsp = new WebSocketAsPromised('ws://localhost:8080/', {
  createWebSocket: url => new W3CWebSocket(url, 'echo-protocol'),
  packMessage: data => JSON.stringify(data),
  unpackMessage: data => JSON.parse(data),
  attachRequestId: (data, requestId) => ({id: requestId, ...data}), // attach requestId to message as `id` field
  extractRequestId: data => data && data.id,
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

;(async () => {
  await wsp.open()

  console.log('Opened')

  const pos = await wsp.sendRequest({ action: 'get-mouse-pos' })

  console.log(pos)

  wsp.sendRequest({
    action: 'move-mouse',
    args: { x: pos.x + 10, y: pos.y + 10 },
  })

  console.log('Sleeping')

  await sleep(500)

  console.log('Sleeping done')

  await wsp
    .sendRequest({
      action: 'take-screenshot',
      args: { x: pos.x, y: pos.y, width: 300, height: 300 },
    }) // actually sends {foo: 'bar', id: 'xxx'}, because `attachRequestId` defined above
    .then(response => {
      let image = response
      image.image = Buffer.from(response.image, 'base64')

      // convert raw buffer to png image
      let jimg = new Jimp(image.width, image.height)
      for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
          const index = y * image.byteWidth + x * image.bytesPerPixel
          const r = image.image[index]
          const g = image.image[index + 1]
          const b = image.image[index + 2]
          const num = r * 256 + g * 256 * 256 + b * 256 * 256 * 256 + 255
          jimg.setPixelColor(num, x, y)
        }
      }

      jimg.write(`jimpimage-client.png`)

      console.log('Done')
    }) // waits server message with corresponding requestId: {id: 'xxx', ...}

  console.log('Closing')

  await wsp.close()
})()
