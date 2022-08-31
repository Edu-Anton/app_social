const {createLogger, format, transports} = require('winston');

// Log
const incluirFecha = format((info) => {
    info.message = `${new Date().toISOString()} ${info.message}`
    return info
})
logger = createLogger({
    transports: [
        new transports.Console({
            level: 'debug',
            handleExceptions: true,
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }),
        new transports.File({
            level: 'info',
            handleExceptions: true,
            format: format.combine(
                incluirFecha(),
                format.simple()
            ),
            maxsize: 5120000,
            maxFiles: 5,
            filename: `${__dirname}/../logs/logDeApp.log`
        })

    ]
})

module.exports = logger;
