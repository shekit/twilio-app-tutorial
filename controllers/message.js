var Subscriber = require('../models/Subscriber');


exports.webhook = function(request, response) {


    var phone = request.body.From;

    
    Subscriber.findOne({
        phone: phone
    }, function(err, sub) {
        if (err) return respond('Derp! Please text back again later.');

        if (!sub) {

            var newSubscriber = new Subscriber({
                phone: phone
            });

            newSubscriber.save(function(err, newSub) {
                if (err || !newSub) 
                    return respond('We couldn\'t sign you up - try again.');

                
                respond('You\'re in the web app class, just a few more sessions left! Learnt anything yet? Reply "yes" or "no"');
            });
        } else {

            processMessage(sub);
        }
    });

    function processMessage(subscriber) {

        var msg = request.body.Body || '';
        msg = msg.toLowerCase().trim();


        if (msg === 'yes' || msg === 'no') {
            // If the user has elected to subscribe for messages, flip the bit
            // and indicate that they have done so.
            subscriber.learnt = msg
            subscriber.save(function(err) {
                if (err)
                    return respond('oops something went wrong');

                // Otherwise, our subscription has been updated
                if(msg == 'yes'){
                    var responseMessage = 'Yayyy...';
                } else {
                    var responseMessage = 'I blame you';
                }

                respond(responseMessage);
            });
        } else {

            var responseMessage = 'I only understand "yes" or "no" :|';

            respond(responseMessage);
        }
    }

    // Set Content-Type response header and render XML (TwiML) response in a 
    // Jade template - sends a text message back to user
    function respond(message) {
        response.type('text/xml');
        response.render('twiml', {
            message: message
        });
    }
};

// Handle form submission
exports.sendMessages = function(request, response) {
    // Get message info from form submission
    var message = request.body.message;
    var imageUrl = request.body.imageUrl;

    // Use model function to send messages to all subscribers
    Subscriber.sendMessage(message, imageUrl, function(err) {
        if (err) {
            request.flash('errors', err.message);
        } else {
            request.flash('successes', 'Messages on their way!');
        }

        response.redirect('/');
    });
};