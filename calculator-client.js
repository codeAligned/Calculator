$(function () {
    "use strict";

    var content = $('#content');
    var input = $('#input');

    var myColor = false;

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    var connection = new WebSocket('ws://127.0.0.1:1337');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
    };

    connection.onerror = function (error) {
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.' } ));
    };

    //incoming calculations
    connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        if (json.type === 'history') { 
            // insert every single message to the previous calculations
            for (var i=0; i < json.data.length; i++) {
                addMessage( json.data[i].text,
                           json.data[i].color);
            }
        } else if (json.type === 'message') { 
            input.removeAttr('disabled'); 
            addMessage( json.data.text,
                       json.data.color);
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };


    //Send mesage when user presses '=' or Enter key
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();

            console.log("here..." + msg);
            if (!msg) {
                return;
            }
            connection.send(msg);
            $(this).val('');
            
            input.attr('disabled', 'disabled');

        }
    });

    
    setInterval(function() {
        if (connection.readyState !== 1) {
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                 + 'with the WebSocket server.');
        }
    }, 3000);

    // Add current calculation
    function addMessage(message, color) {
        content.prepend('<p><span style="color:' + color + '">'  + message + '</p>');
    }
});