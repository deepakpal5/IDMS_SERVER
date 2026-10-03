class WebSocketGateway {

    constructor(server, idmsServer, dashboardServer) {

        server.on("upgrade",

            (request, socket, head) => {

                //-----------------------------------
 if (request.url === "/dashboard") {

                    return dashboardServer.handleUpgrade(

                        request,

                        socket,

                        head

                    );

                }
            

                    return idmsServer.handleUpgrade(

                        request,

                        socket,

                        head

                    );

                

                //-----------------------------------

               

                //-----------------------------------

                socket.destroy();

            });

    }

}

module.exports = WebSocketGateway;