var passport = require('passport');
var log = require('log4js').getLogger('sessions');
module.exports = {
    //login POST
    login: function(req, res, next) {
        var Role = req.models.roles;

        passport.authenticate('local', function(err, user, info) {
            var error = err || info;
            if (error) {
                log.error(error);
                return res.status(401).json(error);
            }
            // Update login info
            //console.log('>> login:' + JSON.stringify(user));
            //console.log('>> login user.serialize:' + JSON.stringify(user.serialize()));
            //console.log('>> req.ip: ' + req.ip);

            if(user.active !== true){
                return res.status(401).json({message: 'Email is Inactive!'});
//                var data = {
//                        email: {
//                        type: 'Email is Inactive!'
//                        }
//                     };
//
//                return res.json(400, {errors: data});
            }

            user.save({
                current_sign_in_ip: req.ip,
                current_sign_in_at: new Date(),
                last_sign_in_ip: user.current_sign_in_ip,
                last_sign_in_at: user.current_sign_in_at
            }, function(err) {
                log.error(err);
                if (err) return next(err);
            });

            Role.get(user.role_id, function(err, role){
                if(err) return next(err);

                user.role = role;
                log.debug('>>login user:'+ JSON.stringify(user));
                req.logIn(user, function(err) {
                    req.user = user;
                    if (err) return next(err);
                    if (req.body.rememberMe) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
                    log.debug(user.serialize());
                    res.status(200).json( user.serialize());
                });
            });


        })(req, res, next);
    },
    //logout DELETE
    logout: function(req, res) {
        log.debug('>> logout req.user: '+ JSON.stringify(req.user));
        if (req.user) {
            req.logout();
            res.status(200).end();
        } else {
            req.session.destroy();
            //res.status(401).send('Not logged in');
            res.status(200).end();
        }
    }

};
