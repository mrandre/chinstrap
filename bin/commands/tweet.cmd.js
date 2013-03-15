"use strict";

// The `tweet` command
module.exports = function (program) {
    program
        .command("tweet <status>")
        .description("140 character message.")
        .option("-j, --json", "Get response as JSON")
        .option("-v, --verbose", "Verbose logging")
        .option("-c, --count", "Count characters in Tweet (will not send)")
        .action(function(msg, opts) {
            if (opts.count) return logger.log("# Chars: " + msg.length);
            twitter.tweet(msg, function (err, tweet) {
                if (err) {
                    logger.error(err.message || err);
                    return;
                }
                logger.json(tweet._raw_);
                logger.log("Tweet Sent @ " + (tweet.created_at).toString() + ".");
            });
        });
};
