var WebSocketServer = require('websocket').server
var http = require('http')
var robot = require('robotjs')

var server = http.createServer(function(request, response) {
  console.log(new Date() + ' Received request for ' + request.url)
  response.writeHead(404)
  response.end()
})

server.listen(8080, function() {
  console.log(new Date() + ' Server is listening on port 8080')
})

wsServer = new WebSocketServer({
  httpServer: server,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false,
})

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true
}

wsServer.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject()
    console.log(
      new Date() + ' Connection from origin ' + request.origin + ' rejected.'
    )
    return
  }

  var connection = request.accept('echo-protocol', request.origin)
  console.log(new Date() + ' Connection accepted.')

  connection.on('message', function(message) {
    const data = JSON.parse(message.utf8Data)

    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data)

      if (
        data.action === 'take-screenshot' &&
        data.args.hasOwnProperty('x') &&
        data.args.hasOwnProperty('y') &&
        data.args.hasOwnProperty('width') &&
        data.args.hasOwnProperty('height')
      ) {
        // get current monitor size
        const monitorSize = robot.getScreenSize()

        // check that the requested coordinates does not exceed the monitor bounds
        const compiledWidth = data.args.x + data.args.width
        const compiledHeight = data.args.y + data.args.height

        if (compiledWidth > monitorSize.width) {
          const difference = compiledWidth - monitorSize.width
          data.args.width = data.args.width - difference
          console.log(
            `Requested width (${compiledWidth}) exceeds monitor bounds (${monitorSize.width}), limiting to ${data.args.width}`
          )
        }

        if (compiledHeight > monitorSize.height) {
          const difference = compiledHeight - monitorSize.height
          data.args.height = data.args.height - difference
          console.log(
            `Requested height (${compiledHeight}) exceeds monitor bounds (${monitorSize.height}), limiting to ${data.args.height}`
          )
        }

        console.log(
          `Taking screenshot at ${data.args.x}, ${data.args.y}, ${data.args.width}, ${data.args.height}`
        )

        var image = robot.screen.capture(
          data.args.x,
          data.args.y,
          data.args.width,
          data.args.height
        )

        // convert to base64
        image.image = Buffer.from(image.image).toString('base64')
        let newImage = { id: data.id, ...image, type: 'image' }

        connection.sendUTF(JSON.stringify(newImage))
      }

      if (
        data.action === 'move-mouse' &&
        data.args.hasOwnProperty('x') &&
        data.args.hasOwnProperty('y')
      ) {
        robot.moveMouse(data.args.x, data.args.y)
        connection.sendUTF(JSON.stringify({ id: data.id }))
      }

      if (data.action === 'get-mouse-pos') {
        const pos = robot.getMousePos()
        connection.sendUTF(JSON.stringify({ id: data.id, ...pos }))
      }
    }
  })

  connection.on('close', function(reasonCode, description) {
    console.log(reasonCode)
    console.log(description)
    console.log(
      new Date() + ' Peer ' + connection.remoteAddress + ' disconnected.'
    )
  })
})
